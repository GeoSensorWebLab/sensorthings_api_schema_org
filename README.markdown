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

TODO: continue this

## License

MIT License

