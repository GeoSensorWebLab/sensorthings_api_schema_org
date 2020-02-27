const bent = require('bent')
const fs = require('fs')
const url = require('url')
const geomHull = require("@thi.ng/geom-hull")
const getJSON = bent('json')

// use an async main function so we can use await for HTTP calls
async function main() {
  /* Collect Input */

  // slice out the first two command line arguments of node and script path
  let args = process.argv.slice(2)

  // URL to the root of the SensorThings API instance to scan
  let staURL = new URL(args[0])
  let fqdn = staURL.hostname

  // Path to directory in which to output report
  let outputDir = args[1]

  /* Init Report */

  // Use "now" as the time for report
  let reportTime = new Date()

  /* Create FOI container polygon */
  // Get FOI collection URL
  let staRoot = await getJSON(staURL)
  let foiResource = staRoot.value.find(element => element.name === "FeaturesOfInterest")
  let foisURL = foiResource.url

  // Download all Features of Interest
  // If there is an "@iot.nextLink" in the response, then continue downloading
  // recursively.
  async function downloadFOIs(url) {
    let response = await getJSON(url)
    let foiCollection = response.value
    if (response["@iot.nextLink"]) {
      let moreFois = await downloadFOIs(response["@iot.nextLink"])
      foiCollection = foiCollection.concat(moreFois)
    }
    return foiCollection
  }

  let fois = await downloadFOIs(foisURL)
  console.log(`${fois.length} features of interest downloaded`)

  // Convert FOI features into array of x-y pairs
  let points = fois.map((foi) => {
    let geometry = foi.feature
    if (geometry.type === "Point") {
      return geometry.coordinates
    }
  })  

  // Create polygon bounding all features
  let polygon = geomHull.grahamScan2(points)

  // If last pair does not equal first pair, re-add first pair at the
  // end to "close" the polygon
  if (polygon[0] !== polygon[polygon.length]) {
    polygon.push(polygon[0])
  }

  // Convert to a GeoJSON Polygon feature
  let foiContainerPolygon = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "Polygon",
      coordinates: polygon
    }
  }

  // Create schema.org document (JSON-LD encoding)
  let report = {
    "@context": {
      "@vocab": "https://schema.org/"
    },
    "@type": "Dataset",
    "@id": staURL.toString(),
    "name": `SensorThings API: ${fqdn}`,
    "description": "A summary of data contained in this SensorThings API instance.",
    "url": staURL.toString(),
    "version": reportTime.toISOString(),
    "keywords": [
      "Sensors", "REST", "SensorThings API", "OGC", "Observations", "Measurements"
    ],
    "isAccessibleForFree": true,
    "spatialCoverage": {
      "@type": "Place",
      "geo": {
        "@type": "GeoShape",
        "polygon": foiContainerPolygon
      }
    }
  }

  /* Output Report */
  let filename = `report-${reportTime.toISOString()}.json`

  fs.writeFileSync(`${outputDir}/${filename}`, JSON.stringify(report, null, "  "))
}

main()
