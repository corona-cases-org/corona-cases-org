'use strict'

let staticData = require('../../../static_data')

class ChartController {
  async index({ view }) {
    throw new Error('not implemented')
    return view.render('charts.index', {
      title: 'Charts',
      staticData: staticData
    })
  }

  async region({ view, params }) {
    let region = params.region
    region = region.replace('-', ' ').replace('_', ' ')
    let regionData = staticData.regions.get(region)
    if (regionData == null) {
      throw new Error('Region not found in dataset')
    }
    return view.render('charts.region', {
      title: 'COVID-19 cases in ' + region,
      region: region,
      regionData: regionData,
    })
  }
}

module.exports = ChartController
