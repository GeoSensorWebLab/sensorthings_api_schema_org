# Schema.org for SensorThings API

A script for generating JSON-LD schema.org documents that summarize the contents of a SensorThings API instance. These reports are stored in a public directory that is then served using a Node.js web server for consumption by schema.org compatible crawlers.

This is unstable software that is still under development. It will likely have API changes in the near future before reaching 1.0.

## Requirements

* Node.js v13
* Yarn
* A SensorThings API instance

## Running the Server

Install dependencies using yarn:

```terminal
$ yarn install
```

Use Node to start the web server:

```terminal
$ node server.js
```

This will start a server on port 5000 serving the contents of the `public` directory.

## Running the Script

Use Node to execute the script with an input SensorThings API instance and an output directory for the schema.org report.

```terminal
$ node report.js http://example.org/v1.0/ public
```

This will generate one JSON-LD file that is timestamped to the start of the script run.

## Deploying to AWS Lambda

This application can be deployed to Amazon Web Services "Lambda" and configured to upload the results to S3. Coupled with CloudWatch, the execution can be ran daily.

As for costs, if 100 instances were being indexed once a day for a month (i.e. 3100 invocations), then a base memory instance and a 40 second execution time would cost $0.26 for that month. See [AWS Lambda Calculator](https://s3.amazonaws.com/lambda-tools/pricing-calculator.html) for examples.

Start by creating an S3 bucket for storing the output JSON-LD files. You will need this bucket's name and availability region for later.

Create a new AWS Lambda function from scratch. Name the function after the instance that is being indexed, e.g. "sta-indexer-arctic-sensors" to make it easier to find later. Choose the latest Node.js as the runtime. For permissions, choose "Create a new role with basic Lambda permissions".

On the next screen, select the "Permissions" tab and open the IAM role that was created for this Lambda function. Add a new inline policy that grants read and write access to the S3 bucket we created earlier, see `examples/s3.json` for an example.

Back in the AWS Lambda editor interface, add a new Trigger for "CloudWatch" and create a new event for running once per day. Set it to "disabled" for now until we know the Lambda function is working. Save and apply it to the Lambda function we are creating.

Use the `build/lambda.sh` Bash script to generate a ZIP file of the necessary code from this repository. Upload the ZIP file to AWS Lambda, and "Save" the function to confirm.

Edit the Environment Variables for the Lambda function to include:

* `S3_BUCKET`
    * The name of the S3 bucket in which to store the output
* `S3_PATH`
    * The prefixed path inside the bucket for the output file, this directory will be created if it does not exist
* `S3_REGION`
    * The AWS availability region for the bucket (e.g. `us-east-1`)
* `STA_URL`
    * The URL of the SensorThings API instance to index

Save the function after adding these.

Under "Basic Settings", change the timeout to 3 minutes as it may take longer with larger STA instances.

At the top of the Lambda function editor, add a new Test Function and call it "GenericTest" and give it an empty JSON object ("`{}`") as its value. It does not need to pass anything into the function so we leave it empty.

Now try to call the "GenericTest" test method to trigger the Lambda and index the STA instance. This may take a minute for a moderately sized instance. Once done, the log output will be displayed with a success or failure.

If it succeeded, then the output should now be visible in the S3 bucket. If there were errors, the error log should give enough context to find the solution.

## Schema.org Mappings

Here is how the properties in the schema.org document are sourced based on the SensorThings API instance.

### `@context`

```json
"@context": {
    "@vocab": "https://schema.org/"
}
```

Contains the default `@vocab` of `https://schema.org/`.

### `@id`

```json
"@id": "https://arctic-sensors.sensorup.com/v1.0/"
```

A static identifier referring to this specific SensorThings API instance.

### `@type`

```json
"@type": "Dataset"
```

See ["Dataset" on the schema.org directory](https://schema.org/Dataset).

### [`description`](https://schema.org/description)

```json
"description": "A summary of data contained in this SensorThings API instance."
```

Very basic description of what is described by this schema.org document.

### [`encodingFormat`](https://schema.org/encodingFormat)

```json
"encodingFormat": "application/json"
```

### Excluded: [`identifier`](https://schema.org/identifier)

There is no central authority for registering SensorThings API instances, yet.

### [`isAccessibleForFree`](https://schema.org/isAccessibleForFree)

```json
"isAccessibleForFree": true
```

Defaults to `true`. If the scanner is able to read the instance, then there are likely no access control restrictions on reading data.

### [`keywords`](https://schema.org/keywords)

```json
"keywords": ["Sensors", "REST", "SensorThings API", "OGC", "Observations", "Measurements"]
```

Some general terms for SensorThings API instances.

### Excluded: [`license`](https://schema.org/license)

```json
"license": "?"
```

Unused currently, as SensorThings API does not include usage restriction metadata currently.

### [`name`](https://schema.org/name)

```json
"name": "SensorThings API: arctic-sensors.sensorup.com"
```

Defaults to the FQDN that serves the SensorThings API instance.

### Excluded: [`sameAs`](https://schema.org/sameAs)

Not used as there is no canonical overview page for a SensorThings API instance. This would be different than the root URL for the instance.

### [`spatialCoverage`](https://schema.org/spatialCoverage)

```json
"spatialCoverage": {
    "@type": "Place",
    "geo": {
        "@type": "GeoShape",
        "polygon": "1 1 5 5 5 1 1 1"
    }
}
```

A polygon that encloses all the Features of Interest in the SensorThings API instance. Generation of this property may be time-consuming depending on the number of FOIs. A polygon is used instead of a bounding box as a polygon is easier to re-project and maintain its shape.

Calculation of the polygon coverage is done using a convex hull algorithm.

### [`temporalCoverage`](https://schema.org/temporalCoverage)

```json
"temporalCoverage": "2020-01-01T00:00:00Z/2020-02-01T00:00:00Z"
```

An ISO8601 interval that spans from the earliest Observation phenomenon time to the latest phenomenon time.

### [`url`](https://schema.org/url)

```json
"url": "https://arctic-sensors.sensorup.com/v1.0/"
```

URL to the base entry point of the SensorThings API instance. In this case it is the same as the `@id` property as we are describing the entire instance rather than a subset inside the instance.

### Excluded: [`variableMeasured`](https://schema.org/variableMeasured)

While the variables being measured could be represented by the Observed Property entities stored in the SensorThings API instance, this list could potentially be very large and cover too many different variables.

### [`version`](https://schema.org/version)

```json
"version": "2020-02-21T17:34:18.553Z"
```

As a SensorThings API instance is typically constantly updating, the "version" tag refers to the date of the summary of the instance. This would mean that a later version tag will be considered more up-to-date and accurate.

## License

MIT License
