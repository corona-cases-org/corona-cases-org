let wtf = require('wtf_wikipedia');
let moment = require('moment');

class DataPoint {
    constructor(date, deaths, recoveries, totalCases) {
        this.date = date;
        this.deaths = deaths;
        this.recoveries = recoveries;
        this.totalCases = totalCases;
    }
}

wtf.fetch('Template:COVID-19_pandemic_data/United_Kingdom_medical_cases_chart', 'en').then((doc) => {
    let chart = doc.template('Medical cases chart');
    console.log(chart)
    console.log(chart.data[34])
    // chart.recoveries (no|n|0)
    let dataSet = {}
    dataSet.casesLabel = chart.altlbl1 || 'Cases';
    dataSet.recoveriesLabel = chart.reclbl || 'Recoveries';
    if (chart.altlbl2 != null || chart.altlbl3 != null) {
        throw new Error('Unexpected extra label');
    }
    dataSet.points = []
    for (let i = 0; i < chart.data.length; i++) {
        let row = chart.data[i];
        dataSet.points.push(new DataPoint(
            moment(row.date, 'YYYY-MM-DD'),
            row.deathsExpr,
            row.recoveriesExpr,
            row.casesExpr
        ))
    }
    console.log(dataSet.points)
    console.log(dataSet.points[34])
    debugger
})
