'use strict'

let locations = require('../../../locations')
let timeseries = require('../../../timeseries')

let items = locations.pathComponentsByIndex.map((pc, index) => ({
  path: locations.pathComponentsToPath(pc),
  pathComponents: pc,
  prettyIds: locations.getPrettyIds(locations.locations[index]),
  location: locations.locations[index],
  index
}))

let homeItems = items.slice()
homeItems.sort((a, b) => a.path.localeCompare(b.path))
homeItems = homeItems.filter(({ index }) =>
  timeseries.localTimeseriesMeta[index].hasField.cases
)

class HomeController {
  async home({ view, params, response }) {
    return view.render('home', {
      items: homeItems
    })
  }

  async li({ view, params, response }) {
    return view.render('li', {
      items: items
    })
  }
}

module.exports = HomeController
