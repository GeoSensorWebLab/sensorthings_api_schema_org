const bent = require('bent')
const fs = require('fs')
const url = require('url')
const geomHull = require("@thi.ng/geom-hull")
const Downloader = require('./lib/Downloader.js')
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
  console.log("Downloading Features of Interest")
  let foiDownloader = new Downloader()
  let fois = await foiDownloader.recursiveGet(foisURL, {}, 2000)
  console.log(`Done. ${fois.length} features of interest downloaded`)

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

  // Convert to a GeoShape Polygon feature
  let foiContainerPolygon = polygon.reduce((memo, pair) => {
    memo += " " + pair.join(" ")
    return memo
  }, "")

  /* Download oldest and newest Observations for temporal range */
  let observationsResource = staRoot.value.find(element => element.name === "Observations")
  let observationsURL = observationsResource.url

  console.log("Downloading Observations")
  let oldDownloader = new Downloader()
  let newDownloader = new Downloader()

  let oldestObservations = await oldDownloader.get(observationsURL, {
    "$top": 1,
    "$orderby": "phenomenonTime asc"
  })

  let newestObservations = await newDownloader.get(observationsURL, {
    "$top": 1,
    "$orderby": "phenomenonTime desc"
  })

  console.log("Done.")

  let temporalCoverage = `${oldestObservations[0].phenomenonTime}/${newestObservations[0].phenomenonTime}`

  // Create schema.org document (JSON-LD encoding)
  let report = {
    "@context": {
      "@vocab": "https://schema.org/"
    },
    "@id": staURL.toString(),
    "@type": "Dataset",
    "description": "A summary of data contained in this SensorThings API instance.",
    "encodingFormat": "application/json",
    "isAccessibleForFree": true,
    "keywords": [
      "Sensors", "REST", "SensorThings API", "OGC", "Observations", "Measurements"
    ],
    "name": `SensorThings API: ${fqdn}`,
    "spatialCoverage": {
      "@type": "Place",
      "geo": {
        "@type": "GeoShape",
        "polygon": foiContainerPolygon
      }
    },
    "temporalCoverage": temporalCoverage,
    "url": staURL.toString(),
    "version": reportTime.toISOString(),
  }

  /* Output Report */
  let filename = `report-${reportTime.toISOString()}.json`

  fs.writeFileSync(`${outputDir}/${filename}`, JSON.stringify(report, null, "  "))
}

main()
