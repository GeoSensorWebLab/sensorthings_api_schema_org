const bent = require('bent')
const geomHull = require("@thi.ng/geom-hull")
const Downloader = require('./Downloader.js')
const getJSON = bent('json')

// Generate a schema.org document for a SensorThings API instance.
// Use the `generate` async function to connect to STA and generate
// the JSON report file.
class Report {
  constructor(staURL) {
    this.staURL = staURL

    // Use "now" as the time for report
    this.reportTime = new Date()
  }

  // Asynchronously generate the report.
  // Use await to block until this function is done downloading metadata
  // from SensorThings API.
  async generate() {
    let fqdn = this.staURL.hostname

    /* Create FOI container polygon */
    // Get FOI collection URL
    let staRoot = await getJSON(this.staURL)
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
    this.report = {
      "@context": {
        "@vocab": "https://schema.org/"
      },
      "@id": this.staURL.toString(),
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
      "url": this.staURL.toString(),
      "version": this.timeString(),
    }
  }

  // Return the Date object for when the report was generated
  getDate() {
    return this.reportTime
  }

  // Return an ISO8601 string of the time that the report was started
  timeString() {
    return this.reportTime.toISOString()
  }

  // Convert the schema.org object to a pretty-printed JSON-LD string
  // for writing to file or stream.
  toJSON() {
    return JSON.stringify(this.report, null, "  ")
  }
}

module.exports = Report
