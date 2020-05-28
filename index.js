let wtf = require('wtf_wikipedia');
let moment = require('moment');
let evaluateExpr = require('./_expr');

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

let pages = process.argv.slice(2);
if (pages.length === 0) {
    pages = ['Template:COVID-19_pandemic_data/United_Kingdom_medical_cases_chart'];
}

async function main() {
    for (let i = 0; i < pages.length; i++) {
        console.time('fetch')
        let doc = await wtf.fetch(pages[i], 'en');
        console.timeEnd('fetch')
        let chart = doc.template('Medical cases chart');
        // console.log(chart)
        // console.log(chart.data[34])
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
        console.log('===', pages[i], '===')
        printDataSet(dataSet);

        // console.log(dataSet.points)
        // console.log(dataSet.points[34])
        // debugger
    }
}

main().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
})
