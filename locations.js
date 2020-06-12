let locations = require('./data/locations.json')

function getPath(location) {
  let fields = ['countryId', 'stateId', 'countyId', 'city']
  let max = fields.length
  while (location[fields[max - 1]] == null) {
    max--
    if (max === 0) {
      console.error(location)
      throw new Error('missing fields')
    }
  }
  return fields.slice(0, max).map((field) => location[field]).join(',')
}

let locationPaths = locations.map(getPath)

let locationIndexByPath = new Map
for (let i = 0; i < locationPaths.length; i++) {
  let path = locationPaths[i]
  while (locationIndexByPath.has(path)) {
    path += '-duplicate'
  }
  locationIndexByPath.set(path, i)
}

module.exports = {
  locations,
  getPath,
  locationPaths,
  locationIndexByPath,
}
