let locations = require('./data/locations.json')

function getPathComponents(location) {
  function inferCountryCode(combinedCode) {
    let countryCode = combinedCode.split('-')[0]
    if (countryCode === 'FR') countryCode = 'FX'
    return countryCode
  }

  let pc = []
  if (!location.countryId) {
    throw new Error('missing country code ' + JSON.stringify(location))
  }
  let countryCode = location.countryId.replace(/^iso1:/, '')
  pc.push(countryCode)

  if (location.stateId) {
    let stateCode = location.stateId.replace(/^iso2:/, '')
    if (inferCountryCode(stateCode) !== countryCode) {
      throw new Error(`Country code (${countryCode}) does not match state code (${stateCode})`)
    }
    stateCode = stateCode.split('-')[1]
    pc.push(stateCode)

    if (location.countyId) {
      let countyCode = (location.countyId
        .split('+')
        .map((subId) => {
          if (subId.match(/^iso2:/)) {
            let subCode = subId.replace(/^iso2:/, '')
            if (inferCountryCode(subCode) !== countryCode) {
              throw new Error(`Country code (${countryCode}) does not match county code (${subCode})`)
            }
            return subCode.split('-')[1]
          } else {
            return subId.replace(/^fips:/, '')
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
    return id.split('+').map((subId) => subId.replace(/^.*:/, '')).join(' ')
  }

  return {
    countryId: prettify(location.countryId),
    stateId: prettify(location.stateId),
    countyId: prettify(location.countyId),
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

function pathComponentsToPath(pc) {
  return pc.map((c) => '/' + encodeURIComponent(c)).join('').replace(/%20/g, '+')
}

module.exports = {
  locations,
  getPrettyIds,
  pathComponentsByIndex,
  getIndexByPathComponents,
  pathComponentsToPath,
}
