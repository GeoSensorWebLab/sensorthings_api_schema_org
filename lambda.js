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
// S3_REGION: The name of the AWS distribution region (e.g. us-east-1)
// STA_URL:   The URL to the SensorThings API instance that will be indexed.

let s3 = new AWS.S3({
  region: process.env.S3_REGION
})

exports.handler = async (event) => {
  console.log(process.env.S3_BUCKET, process.env.S3_PATH, process.env.STA_URL)

  // URL to the root of the SensorThings API instance to scan
  let staURL = new URL(process.env.STA_URL)

  // Generate Report
  let report = new Report(staURL)
  await report.generate()

  // Upload to S3
  console.log(`Uploading to bucket ${process.env.S3_BUCKET}/${process.env.S3_PATH}/.`)
  let putDoc = s3.putObject({
    ACL:         "public-read",
    Body:        report.toJSON(),
    Bucket:      process.env.S3_BUCKET,
    ContentType: "application/json",
    Key:         `${process.env.S3_PATH}/${report.timeString()}.json`
  }, (err, data) => {
    if (err) {
      console.error(err, err.stack)
    } else {
      console.log("Finished upload.", data)
    }
  })

  await putDoc.promise()
}
