const AWS = require('aws-sdk')
const url = require('url')
const Report = require('./lib/Report.js')

// Script for usage on AWS Lambda.
// 
// # ENVIRONMENT VARIABLES
// 
// Instead of command-line arguments, the following shell environment
// variables are used instead.
// 
// S3_BUCKET: The name of the S3 bucket where the output will be uploaded
// S3_PATH:   The directory path in the S3 bucket to use. Will be created if it does not exist.
// STA_URL:   The URL to the SensorThings API instance that will be indexed.

let s3 = new AWS.S3()

exports.handler = async (event) => {
  // URL to the root of the SensorThings API instance to scan
  let staURL = new URL(process.env.STA_URL)

  // Generate Report
  let report = new Report(staURL)
  await report.generate()

  // Upload to S3
  s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: `${process.env.S3_PATH}/${report.timeString()}.json`,
    Body: report.toJSON(),
    ContentType: "application/json"
  }, (err, data) => {
    if (err) {
      console.error(err, err.stack)
    } else {
      console.log(data)
    }
  })
}