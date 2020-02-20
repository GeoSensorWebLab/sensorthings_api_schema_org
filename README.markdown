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

### [`name`](https://schema.org/name)

### [`description`](https://schema.org/description)

### [`url`](https://schema.org/url)

### Excluded: [`sameAs`](https://schema.org/sameAs)

Not used as there is no canonical overview page for a SensorThings API instance. This would be different than the root URL for the instance.

### [`version`](https://schema.org/version)

### [`isAccessibleForFree`](https://schema.org/isAccessibleForFree)

### [`keywords`](https://schema.org/keywords)

### [`license`](https://schema.org/license)

### [`identifier`](https://schema.org/identifier)

### [`spatialCoverage`](https://schema.org/spatialCoverage)

### [`temporalCoverage`](https://schema.org/temporalCoverage)

### [`variableMeasured`](https://schema.org/variableMeasured)

## License

MIT License

