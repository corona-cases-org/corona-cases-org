'use strict'

let locations = require('../../../locations')
let timeseries = require('../../../timeseries')

class ChartController {
  async region({ view, params, response }) {
    let locationPath = decodeURIComponent(params.location)
    let locationIndex = locations.locationIndexByPath.get(locationPath)
    if (locationIndex == null) {
      throw new Error('Location not found in dataset')
    }
    let location = locations.locations[locationIndex]
    let localTimeseries = timeseries.localTimeseries[locationIndex]
    return view.render('charts.region', {
      title: 'COVID-19 cases in ' + location.name,
      location,
      localTimeseries
    })
  }
}

module.exports = ChartController
