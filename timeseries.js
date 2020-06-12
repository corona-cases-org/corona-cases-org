let timeseries = require('./data/timeseries.json')
let locations = require('./locations.js')

function makeTimeseries(index) {
  let ts = {}
  for (let date in timeseries) {
    if (Object.keys(timeseries[date][index] || {}).length > 0) {
      ts[date] = timeseries[date][index]
    }
  }
  return ts
}

let localTimeseries = []
for (let i = 0; i < locations.locations.length; i++) {
  localTimeseries.push(makeTimeseries(i))
}

let fields = new Set
for (let ts of localTimeseries) {
  for (point of Object.values(ts)) {
    for (key in point) {
      fields.add(key)
    }
  }
}
fields = Array.from(fields)
fields.sort()

localTimeseriesMeta = localTimeseries.map((ts) => {
  let hasField = {}
  for (let field of fields) {
    hasField[field] = false
  }
  for (let point of Object.values(ts)) {
    for (let field in point) {
      hasField[field] = true
    }
  }
  return {
    hasField
  }
})

module.exports = {
  timeseries,
  localTimeseries,
  localTimeseriesMeta,
}
