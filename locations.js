let timeseries = require('./timeseries')
let locations = require('./data/locations.json')

function getPathComponents(location) {
  function inferCountryCode(combinedCode) {
    let countryCode = combinedCode.split('-')[0]
    // if (countryCode === 'FR') countryCode = 'FX'
    return countryCode
  }

  let pc = []
  if (!location.countryID) {
    throw new Error('missing country code ' + JSON.stringify(location))
  }
  let countryCode = location.countryID.replace(/^iso1:/, '')
  if (countryCode === 'FX') {
    countryCode = 'FR'
  }
  if (countryCode === 'PR' && location.stateID === 'iso2:US-PR') {
    countryCode = 'US'
  }
  pc.push(countryCode)

  if (location.stateID) {
    let stateCode = location.stateID.replace(/^iso2:/, '')
    if (inferCountryCode(stateCode) !== countryCode) {
      throw new Error(`Country code (${countryCode}) does not match state code (${stateCode})`)
    }
    stateCode = stateCode.split('-')[1]
    pc.push(stateCode)

    if (location.countyID) {
      let countyCode = (location.countyID
        .split('+')
        .map((subID) => {
          if (subID.match(/^iso2:/)) {
            let subCode = subID.replace(/^iso2:/, '')
            if (inferCountryCode(subCode) !== countryCode) {
              throw new Error(`Country code (${countryCode}) does not match county code (${subCode})`)
            }
            return subCode.split('-')[1]
          } else {
            return subID.replace(/^fips:/, '')
          }
        })
        .join(' ')
      )
      pc.push(countyCode)

      if (location.city) {
        pc.push(location.city)
      }
    }
  }

  for (let component of pc) {
    if (component.match(':')) {
      throw new Error('unknown scheme in ' + component)
    }
    if (component.match('/')) {
      throw new Error('unexpected `/` in ' + component)
    }
  }
  return pc
}

function getPrettyIds(location) {
  function prettify(id) {
    if (id == null) return null
    return id.split('+').map((subID) => subID.replace(/^.*:/, '')).join(' ')
  }

  return {
    countryID: prettify(location.countryID),
    stateID: prettify(location.stateID),
    countyID: prettify(location.countyID),
  }
}

let pathComponentsByIndex = []
let locationIndexByPathComponents = new Map
function getIndexByPathComponents(pc) {
  return locationIndexByPathComponents.get(JSON.stringify(pc))
}
for (let i = 0; i < locations.length; i++) {
  let pc = getPathComponents(locations[i])
  while (getIndexByPathComponents(pc) != null) {
    pc[pc.length - 1] += '-duplicate'
    if (pc.join().length > 1000) {
      // This can cause hangs because quadratic
      throw new Error('Too many duplicates: ' + pc.join())
    }
  }
  locationIndexByPathComponents.set(JSON.stringify(pc), i)
  pathComponentsByIndex.push(pc)
}

function getShortName(location) {
  return location[location.level + 'Name']
}

let locators = locations.map((location, i) => {
  let pathComponents = pathComponentsByIndex[i]
  return {
    pathComponents,
    path: pathComponentsToPath(pathComponents),
    shortName: getShortName(location)
  }
})

for (let i = 0; i < locators.length; i++) {
  let pc = locators[i].pathComponents
  if (pc.length > 1) {
    let parentIndex = getIndexByPathComponents(pc.slice(0, pc.length - 1))
    if (parentIndex == null) {
      throw new Error('Missing parent for ' + JSON.stringify(pc))
    }
    locators[i].parent = locators[parentIndex]
  } else {
    locators[i].parent = null
  }
}

for (let i = 0; i < locations.length; i++) {
  let extra = {}
  locations[i].extra = extra
  extra.locator = locators[i]
  extra.current = timeseries.localTimeseriesExtra[i].current
  extra.hasField = timeseries.localTimeseriesExtra[i].hasField
  extra.lastUpdate = timeseries.localTimeseriesExtra[i].lastUpdate
}

function pathComponentsToPath(pc) {
  return pc.map((c) => '/' + encodeURIComponent(c)).join('').replace(/%20/g, '+')
}

module.exports = {
  locations,
  getPrettyIds,
  pathComponentsByIndex,
  getIndexByPathComponents,
  pathComponentsToPath,
  locators,
}
