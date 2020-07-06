let timeseries = require('./data/timeseries.json')
let locations = require('./data/locations.json')

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
for (let i = 0; i < locations.length; i++) {
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

localTimeseriesExtra = localTimeseries.map((ts) => {
  let hasField = {}
  for (let field of fields) {
    hasField[field] = false
  }
  let current = {
    cases: null,
    recovered: null,
    deaths: null,
  }
  let dates = Object.keys(ts)
  dates.sort()
  for (let date of dates) {
    let point = ts[date]
    for (let field in point) {
      hasField[field] = true
    }
    if (point.cases != null) {
      current.cases = point.cases
    }
    if (point.recovered != null) {
      current.recovered = point.recovered
    }
    if (point.deaths != null) {
      current.deaths = point.deaths
    }
  }
  let lastUpdate = dates[dates.length - 1]
  return {
    hasField,
    current,
    lastUpdate,
  }
})

module.exports = {
  timeseries,
  localTimeseries,
  localTimeseriesExtra,
}
