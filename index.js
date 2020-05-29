let fs = require('fs')

let fetch = require('node-fetch')
let wtf = require('wtf_wikipedia')
let moment = require('moment')
let evaluateExpr = require('./_expr')

class DataPoint {
  constructor(date, deaths, recoveries, totalCases) {
    this.date = date;
    this.deaths = deaths;
    this.recoveries = recoveries;
    this.totalCases = totalCases;
  }
}

function printDataSet(dataSet) {
  console.log('Date        Deaths Recoveries Cases');
  for (let i = 0; i < dataSet.points.length; i++) {
    let point = dataSet.points[i];
    console.log(
      point.date.format('YYYY-MM-DD'),
      (point.deaths + '').padStart(7),
      (point.recoveries + '').padStart(7),
      (point.totalCases + '').padStart(7));
  }
  console.log('')
}

async function findCharts() {

}

async function main() {
  let pages = process.argv.slice(2);
  if (pages.length === 0) {
    let rawResponse = await fetch('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=intitle:chart%20prefix:Template:COVID-19_pandemic_data/&utf8=&format=json&srlimit=500&srprop=')
    let response = await rawResponse.json()
    if (response.continue) {
      console.error(response)
      throw new Error('paging not implemented')
    }
    pages = response.query.search.map((item) => item.title).filter((title) => !title.match('/doc'))
  }

  console.time('fetch')
  let docs = [];
  let strideLength = 50;
  for (let i = 0; i < pages.length; i += strideLength) {
    console.log('fetching', i, '-', i + strideLength - 1)
    let pageSubset = pages.slice(i, i + strideLength)

    let docsSubset = await wtf.fetch(pageSubset, 'en')
    // let docsSubset = [ null, null ]
    if (docsSubset == null) {
      console.error(pageSubset)
      throw new Error('did not receive pages')
    }
    if (!Array.isArray(docsSubset)) docsSubset = [docsSubset]
    docs = docs.concat(docsSubset)
    await new Promise(r => setTimeout(r, 2000));
  }
  console.timeEnd('fetch')
  let wikipediaPages = []
  for (let i = 0; i < docs.length; i++) {
    let doc = docs[i]
    let wikipediaPage = {
      url: doc.url(),
      title: doc.title()
    }
    try {
      let chart = doc.template('Medical cases chart');
      if (chart == null) {
        throw new Error('Medical_cases_chart not found')
      }
      //chart.recoveries (no|n|0)
      let dataSet = {};
      dataSet.casesLabel = chart.altlbl1 || 'Cases';
      dataSet.recoveriesLabel = chart.reclbl || 'Recoveries';
      if (chart.altlbl2 != null || chart.altlbl3 != null) {
        throw new Error('Unexpected extra label');
      }
      dataSet.points = []
      for (let j = 0; j < chart.data.length; j++) {
        let row = chart.data[j];
        dataSet.points.push(new DataPoint(
          moment(row.date, 'YYYY-MM-DD'),
          evaluateExpr(row.deathsExpr),
          evaluateExpr(row.recoveriesExpr),
          evaluateExpr(row.casesExpr)
        ))
      }
      wikipediaPage.ok = dataSet
    } catch (err) {
      wikipediaPage.err = err + ''
    }
    wikipediaPages.push(wikipediaPage)
  }
  fs.writeFileSync('data.json', JSON.stringify(wikipediaPages))
}

main().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
})
