'use strict'

let locations = require('../../../locations')
let timeseries = require('../../../timeseries')

class ChartController {
  async region({ view, params, response }) {
    let pathComponents = ([params.p1, params.p2, params.p3, params.p4]
      .filter((c) => c != null)
      .map(decodeURIComponent)
      .map((c) => c.replace(/\+/g, ' ')) // according to MDN this is how you decode query strings
    )
    let locationIndex = locations.getIndexByPathComponents(pathComponents)
    if (locationIndex == null) {
      throw new Error('Location not found in dataset: ' + JSON.stringify(pathComponents))
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
