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
    let title = wikipediaPage.title
    let url = wikipediaPage.url
    let dataSet = wikipediaPage.ok
    let match = title.match(/^Template:COVID-19 pandemic data\/(.*) medical cases chart$/)
    let region = match ? match[1] : title;
    database.regions.set(region, {
      title,
      url,
      dataSet
    })
  }
}

module.exports = database
