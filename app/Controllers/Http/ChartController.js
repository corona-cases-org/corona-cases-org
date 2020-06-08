'use strict'

let staticData = require('../../../static_data')

let regionAliases = [
  ['uk', 'United Kingdom'],
  ['us', 'United States'],
  ['usa', 'United States'],
]

let regions = Array.from(staticData.regions.keys())
let canonicalRegions = new Map
function normalizeRegion(region) {
  return region.replace(/_|-/, ' ').toLowerCase()
}
for (let i = 0; i < regions.length; i++) {
  canonicalRegions.set(normalizeRegion(regions[i]), regions[i])
}
for (let i = 0; i < regionAliases.length; i++) {
  let [alias, target] = regionAliases[i]
  canonicalRegions.set(
    normalizeRegion(alias),
    canonicalRegions.get(normalizeRegion(target))
  )
}
function getRegionKey(region) {
  return canonicalRegions.get(normalizeRegion(region))
}
function getRegionPath(region) {
  return canonicalRegions.get(normalizeRegion(region)).replace(' ', '-').toLowerCase()
}

class ChartController {
  async region({ view, params, response }) {
    let region = decodeURIComponent(params.region)
    let regionPath = getRegionPath(region)
    if (regionPath == null) {
      throw new Error('Region not found in dataset')
    }
    if (regionPath !== region) {
      response.redirect('/' + encodeURIComponent(regionPath))
      return
    }
    let regionKey = getRegionKey(region)
    let regionData = staticData.regions.get(regionKey)
    return view.render('charts.region', {
      title: 'COVID-19 cases in ' + regionKey,
      region: regionKey,
      regionData: regionData,
    })
  }
}

module.exports = ChartController
