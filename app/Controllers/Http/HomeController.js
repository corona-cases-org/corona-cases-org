'use strict'

let locations = require('../../../locations')
let timeseries = require('../../../timeseries')

let paths = locations.pathComponentsByIndex.map((pc, index) => ({
  path: locations.pathComponentsToPath(pc),
  index
}))
paths.sort((a, b) => a.path.localeCompare(b.path))

let locationList = []
for (let i = 0; i < paths.length; i++) {
  let { index, path } = paths[i]
  let location = locations.locations[index]
  if (!timeseries.localTimeseriesMeta[index].hasField.cases) {
    continue
  }
  locationList.push({
    url: path,
    name: location.name
  })
}

class HomeController {
  async home({ view, params, response }) {
    return view.render('home', {
      locationList: locationList
    })
  }
}

module.exports = HomeController
