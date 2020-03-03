const bent = require('bent')
const IntegerProgressIndicator = require('./IntegerProgressIndicator.js')
const getJSON = bent('json')

// Recursively download an entity collection from SensorThings API.
// A progress indicator will be drawn to the console.
class Downloader {
  constructor() {
    this.indicator = new IntegerProgressIndicator()
  }

  async get(url, queryOptions) {
    if (queryOptions) {
      url += this._toQueryString(queryOptions)
    }
    let response = await getJSON(url)
    let collection = response.value
    
    this.indicator.setTotal(response["@iot.count"])
    this.indicator.addProgress(collection.length)
    
    return collection
  }

  async recursiveGet(url, queryOptions, limit) {
    if (queryOptions) {
      url += this._toQueryString(queryOptions)
    }
    let response = await getJSON(url)
    let collection = response.value
    
    this.indicator.setTotal(response["@iot.count"])
    this.indicator.addProgress(collection.length)
    let progress = this.indicator.getProgress()
    
    if (response["@iot.nextLink"] && !(limit !== undefined && progress >= limit)) {
      let moreEntities = await this.recursiveGet(response["@iot.nextLink"], undefined, limit)
      collection = collection.concat(moreEntities)
    }
    return collection
  }

  // Convert query options object into query string
  _toQueryString(options) {
    return "?" + Object.keys(options).reduce((memo, key) => {
      memo.push(`${key}=${options[key]}`)
      return memo
    }, []).join("&")
  }
}

module.exports = Downloader
