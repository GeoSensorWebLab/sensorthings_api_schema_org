# Schema.org for SensorThings API

A script for generating JSON-LD schema.org documents that summarize the contents of a SensorThings API instance. These reports are stored in a public directory that is then served using a Node.js web server for consumption by schema.org compatible crawlers.

## Requirements

* Node.js v13
* Yarn
* A SensorThings API instance

## Running the Server

Install dependencies using yarn:

```
$ yarn install
```

Use Node to start the web server:

```
$ node server.js
```

This will start a server on port 5000 serving the contents of the `public` directory.

## Running the Script

Use Node to execute the script with an input SensorThings API instance and an output directory for the schema.org report.

```
$ node report.js http://example.org/v1.0/ public
```

This will generate one JSON-LD file that is timestamped to the start of the script run.

## Schema.org Mappings

Here is how the properties in the schema.org document are sourced based on the SensorThings API instance.

### `@context`

```
"@context": {
    "@vocab": "https://schema.org/"
}
```

Contains the default `@vocab` of `https://schema.org/`.

### `@type`

```
"@type": "Dataset"
```

See ["Dataset" on the schema.org directory](https://schema.org/Dataset).

### `@id`

```
"@id": "https://arctic-sensors.sensorup.com/v1.0/"
```

A static identifier referring to this specific SensorThings API instance.

### [`name`](https://schema.org/name)

```
"name": "SensorThings API: arctic-sensors.sensorup.com"
```

Defaults to the FQDN that serves the SensorThings API instance.

### [`description`](https://schema.org/description)

```
"description": "A summary of data contained in this SensorThings API instance."
```

Very basic description of what is described by this schema.org document.

### [`url`](https://schema.org/url)

```
"url": "https://arctic-sensors.sensorup.com/v1.0/"
```

URL to the base entry point of the SensorThings API instance. In this case it is the same as the `@id` property as we are describing the entire instance rather than a subset inside the instance.

### Excluded: [`sameAs`](https://schema.org/sameAs)

Not used as there is no canonical overview page for a SensorThings API instance. This would be different than the root URL for the instance.

### [`version`](https://schema.org/version)

```
"version": "2020-02-21T17:34:18.553Z"
```

As a SensorThings API instance is typically constantly updating, the "version" tag refers to the date of the summary of the instance. This would mean that a later version tag will be considered more up-to-date and accurate.

### [`isAccessibleForFree`](https://schema.org/isAccessibleForFree)

```
"isAccessibleForFree": true
```

Defaults to `true`. If the scanner is able to read the instance, then there are likely no access control restrictions on reading data.

### [`keywords`](https://schema.org/keywords)

```
"keywords": ["Sensors", "REST", "SensorThings API", "OGC", "Observations", "Measurements"]
```

Some general terms for SensorThings API instances.

### Excluded: [`license`](https://schema.org/license)

```
"license": "?"
```

Unused currently, as SensorThings API does not include usage restriction metadata currently.

### Excluded: [`identifier`](https://schema.org/identifier)

There is no central authority for registering SensorThings API instances, yet.

### [`spatialCoverage`](https://schema.org/spatialCoverage)

```
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

### [`variableMeasured`](https://schema.org/variableMeasured)

## License

MIT License

