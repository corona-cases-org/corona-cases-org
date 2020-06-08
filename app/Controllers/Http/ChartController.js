'use strict'

let staticData = require('../../../static_data')
let regions = require('../../../regions')

class ChartController {
  async region({ view, params, response }) {
    let region = decodeURIComponent(params.region)
    let regionPath = regions.getRegionPath(region)
    if (regionPath == null) {
      throw new Error('Region not found in dataset')
    }
    if (regionPath !== region) {
      response.redirect('/' + encodeURIComponent(regionPath))
      return
    }
    let regionKey = regions.getRegionKey(region)
    let regionData = staticData.regions.get(regionKey)
    return view.render('charts.region', {
      title: 'COVID-19 cases in ' + regionKey,
      regionName: regionKey,
      regionData: regionData,
    })
  }
}

module.exports = ChartController
