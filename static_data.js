let data = require('./data.json')

let database = {
  regions: new Map,
  errors: []
};

for (let i = 0; i < data.length; i++) {
  let wikipediaPage = data[i]
  if (wikipediaPage.err) {
    database.errors.push(wikipediaPage)
  } else {
    let dataSet = wikipediaPage.ok
    dataSet.wikipediaTitle = wikipediaPage.title
    dataSet.wikipediaUrl = wikipediaPage.url
    // Filter "..." pseudo-points
    dataSet.points = dataSet.points.filter((point) => point.date != null)
    let match = dataSet.wikipediaTitle.match(/^Template:COVID-19 pandemic data\/(.*) medical cases chart$/)
    let region = match ? match[1] : dataSet.wikipediaTitle;
    database.regions.set(region, dataSet)
  }
}

module.exports = database
