'use strict'

let regions = require('../../../regions')

let regionList = regions.regions.map((region) => ({
  url: '/' + encodeURIComponent(regions.getRegionPath(region)),
  name: regions.getRegionKey(region)
})).sort((a, b) => a.name.localeCompare(b.name))


class HomeController {
  async home({ view, params, response }) {
    return view.render('home', {
      regions: regionList
    })
  }
}

module.exports = HomeController
