'use strict'

let locations = require('../../../locations')
let timeseries = require('../../../timeseries')

let paths = locations.locationPaths.slice()
paths.sort()

let locationList = []
for (let i = 0; i < paths.length; i++) {
  let index = locations.locationIndexByPath.get(paths[i]);
  let location = locations.locations[index]
  if (!timeseries.localTimeseriesMeta[index].hasField.cases) {
    continue
  }
  locationList.push({
    url: '/' + encodeURIComponent(paths[i]),
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
