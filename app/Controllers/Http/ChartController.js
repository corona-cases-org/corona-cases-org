'use strict'

let locations = require('../../../locations')
let timeseries = require('../../../timeseries')

class ChartController {
  getPathComponents(params) {
    return ([params.p1, params.p2, params.p3, params.p4]
      .filter((c) => c != null)
      .map(decodeURIComponent)
      .map((c) => c.replace(/\+/g, ' ')) // according to MDN this is how you decode query strings
    )
  }

  getLocationIndex(pathComponents) {
    let locationIndex = locations.getIndexByPathComponents(pathComponents)
    if (locationIndex == null) {
      throw new Error('Location not found in dataset: ' + JSON.stringify(pathComponents))
    }
    return locationIndex
  }

  async region({ view, params, response }) {
    let pathComponents = this.getPathComponents(params)
    let locationIndex = this.getLocationIndex(pathComponents)
    let location = Object.assign({}, locations.locations[locationIndex])
    location.dates = timeseries.localTimeseries[locationIndex]
    return view.render('charts.region', {
      title: 'COVID-19 cases in ' + location.name,
      location,
      payload: location,
    })
  }

  async li({ view, params, response }) {
    let pathComponents = this.getPathComponents(params)
    let locationIndex = this.getLocationIndex(pathComponents)
    let location = Object.assign({}, locations.locations[locationIndex])
    location.dates = timeseries.localTimeseries[locationIndex]
    return view.render('charts.li', {
      title: 'Li data for ' + location.name,
      location,
      payload: location,
    })
  }
}

module.exports = ChartController
