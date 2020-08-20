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

  getParents(locator) {
    let parents = []
    while (locator.parent != null) {
      locator = locator.parent
      parents.unshift(locator)
    }
    return parents
  }

  getChildren(locator) {
    return locations.locators
      .slice()
      .filter((loc) => loc.parent === locator)
      .sort((a, b) => (a.shortName.localeCompare(b.shortName))
    )
  }

  async region({ view, params, response }) {
    let pathComponents = this.getPathComponents(params)
    let locationIndex = this.getLocationIndex(pathComponents)
    let location = Object.assign({}, locations.locations[locationIndex])
    location.dates = timeseries.localTimeseries[locationIndex]
    let parents = this.getParents(location.extra.locator)
    let children = this.getChildren(location.extra.locator)
    let titleName = location.name
    // Fix up country codes in location names until upstream merges fix
    if (titleName.endsWith(location.countryID.split(':')[1])) {
      titleName = titleName.slice(0, titleName.length - location.countryID.split(':')[1].length) + location.countryName
    }
    if (titleName.endsWith(', ' + location.countryName)) {
      titleName = titleName.slice(0, titleName.length - (', ' + location.countryName).length)
    } else if (titleName.endsWith(', ' + location.countryID.split(':')[1])) {
      titleName = titleName.slice(0, titleName.length - (', ' + location.countryID.split(':')[1]).length)
    }

    let description = ''
    if (location.extra.lastUpdate && location.extra.current.cases != null) {
      let lastUpdate = new Date(location.extra.lastUpdate).toLocaleDateString('en-US', { dateStyle: 'long' })
      description = `As of ${lastUpdate}, there have been ${location.extra.current.cases.toLocaleString('en-US')} reported COVID-19 cases in ${location.extra.locator.shortName}.`
    }

    return view.render('charts.region', {
      location,
      titleName,
      description,
      parents,
      children,
      payload: { location },
    })
  }

  async li({ view, params, response }) {
    let pathComponents = this.getPathComponents(params)
    let locationIndex = this.getLocationIndex(pathComponents)
    let location = Object.assign({}, locations.locations[locationIndex])
    location.dates = timeseries.localTimeseries[locationIndex]

    let originalLocation = Object.assign({}, location)
    delete originalLocation.extra // unenhance

    return view.render('charts.li', {
      title: 'Li data for ' + location.name,
      location,
      originalLocation,
      currentPath: locations.pathComponentsToPath(pathComponents),
      payload: { location },
    })
  }

  async json({ view, params, response }) {
    let pathComponents = this.getPathComponents(params)
    let locationIndex = this.getLocationIndex(pathComponents)
    let location = Object.assign({}, locations.locations[locationIndex])
    location.dates = timeseries.localTimeseries[locationIndex]
    response.json(JSON.stringify(location, null, 2))
  }
}

module.exports = ChartController
