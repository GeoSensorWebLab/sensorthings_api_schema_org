const fs = require('fs')
const url = require('url')
const Report = require('./lib/Report.js')

// This main function will process the command-line arguments,
// generate the schema.org report file for the SensorThings API 
// instance, then output the result to a JSON file in an output
// directory.
// Uses an async main function so we can use await for HTTP calls.
async function main() {
  /* Collect Input */

  // slice out the first two command line arguments of node and script path
  let args = process.argv.slice(2)

  // URL to the root of the SensorThings API instance to scan
  let staURL = new URL(args[0])

  // Path to directory in which to output report
  let outputDir = args[1]

  /* Create and Generate Report */
  let report = new Report(staURL)
  await report.generate()
  
  /* Output Report */
  let filename = `report-${report.timeString()}.json`
  fs.writeFileSync(`${outputDir}/${filename}`, report.toJSON())
}

main()
