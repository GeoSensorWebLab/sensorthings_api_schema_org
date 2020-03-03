const bent = require('bent')
const IntegerProgressIndicator = require('./IntegerProgressIndicator.js')
const getJSON = bent('json')

// Recursively download an entity collection from SensorThings API.
// A progress indicator will be drawn to the console.
class Downloader {
  constructor() {
    this.indicator = new IntegerProgressIndicator()
  }

  async get(url) {
    let response = await getJSON(url)
    let collection = response.value
    
    this.indicator.setTotal(response["@iot.count"])
    this.indicator.addProgress(collection.length)
    
    if (response["@iot.nextLink"]) {
      let moreEntities = await this.get(response["@iot.nextLink"])
      collection = collection.concat(moreEntities)
    }
    return collection
  }
}

module.exports = Downloader
