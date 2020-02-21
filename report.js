const fs = require('fs');

/* Collect Input */

// slice out the first two command line arguments of node and script path
let args = process.argv.slice(2);

// URL to the root of the SensorThings API instance to scan
let staURL = args[0];

// Path to directory in which to output report
let outputDir = args[1];

/* Init Report */

// Use "now" as the time for report
let reportTime = new Date();

let report = {};

/* Output Report */
let filename = `report-${reportTime.toISOString()}.json`;

fs.writeFileSync(`${outputDir}/${filename}`, JSON.stringify(report));
