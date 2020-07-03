'use strict'

let locations = require('../../../locations')
let timeseries = require('../../../timeseries')

let liItems = locations.pathComponentsByIndex.map((pc, index) => ({
  path: locations.pathComponentsToPath(pc),
  pathComponents: pc,
  prettyIds: locations.getPrettyIds(locations.locations[index]),
  location: locations.locations[index],
  index
}))

let homeLocations = locations.locations
  .filter((loc) => loc.level === 'country')
  .sort((a, b) => (b.extra.current.cases - a.extra.current.cases) || a.name.localeCompare(b.name))

class HomeController {
  async home({ view, params, response }) {
    return view.render('home', {
      locations: homeLocations
    })
  }

  async li({ view, params, response }) {
    return view.render('li', {
      items: liItems
    })
  }
}

module.exports = HomeController
