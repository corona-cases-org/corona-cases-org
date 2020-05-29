'use strict'

let staticData = require('../../../static_data')

class ChartController {
  async index({ view }) {
    return view.render('charts.index', {
      title: 'foo',
      staticData: staticData
    })
  }

  async region({ view, params }) {
    let region = params.region
    let regionData = staticData.regions.get(region)
    if (regionData == null) {
      throw new Error('Not found')
    }
    return view.render('charts.region', {
      title: 'COVID-19 in ' + region,
      region: region
    })
  }
}

module.exports = ChartController
