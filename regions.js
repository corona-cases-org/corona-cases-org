let staticData = require('./static_data')

let regionAliases = [
  ['uk', 'United Kingdom'],
  ['us', 'United States'],
  ['usa', 'United States'],
]

let regions = Array.from(staticData.regions.keys())
let canonicalRegions = new Map
function normalizeRegion(region) {
  return region.replace(/_|-/g, ' ').toLowerCase()
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
  return canonicalRegions.get(normalizeRegion(region)).replace(/ /g, '-').toLowerCase()
}

module.exports = {
  regions,
  canonicalRegions,
  getRegionKey,
  getRegionPath
}
