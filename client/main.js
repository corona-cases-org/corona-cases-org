import Highcharts from "highcharts";
import moment from "moment/dist/moment"
import * as React from "react"
import * as ReactDom from "react-dom"
import HighchartsReact from "highcharts-react-official"

import { Chart } from "./charts"

window.App = {}

function dateStringToDate(dateString) {
  let m = moment(dateString, 'YYYY-MM-DD')
  return Date.UTC(m.year(), m.month(), m.date())
}

function getPayload() {
  return JSON.parse($('#payload').attr('data-payload'))
}

function getSeriesSet(location) {
  let localTimeseries = location.dates
  let previousTotalCases = 0
  let previousTotalDeaths = 0
  let newCases = []
  let totalCases = []
  let activeCases = []
  let newDeaths = []
  let totalDeaths = []
  let recovered = []
  let dates = Object.keys(localTimeseries)
  dates.sort()
  for (let dateString of dates) {
    let date = dateStringToDate(dateString)
    let point = localTimeseries[dateString]
    if (point.cases != null) {
      totalCases.push([date, point.cases])
      newCases.push([date, point.cases - previousTotalCases])
      previousTotalCases = point.cases
    }
    if (point.deaths != null) {
      totalDeaths.push([date, point.deaths])
      newDeaths.push([date, point.deaths - previousTotalDeaths])
      previousTotalDeaths = point.deaths
    }
    if (point.active != null || point.cases != null) {
      let active = point.active != null ? point.active :
        (point.cases || 0) - (point.recovered || 0) - (point.deaths || 0)
      activeCases.push([date, active])
    }
    if (point.recovered != null) {
      recovered.push([date, point.recovered])
    }
  }
  return { newCases, totalCases, activeCases, recovered, totalDeaths, newDeaths }
}

window.App.render = render
function render() {
  $(() => {
    let { location } = getPayload()
    let seriesSet = getSeriesSet(location)

    if (location.extra.current.cases > 0) {
      let TotalCasesChart = () => <Chart
        options={{
          chart: {
            type: 'line',
          },
          series: [
            {
              name: "Confirmed cases (total)",
              data: seriesSet.totalCases,
            },
          ],
        }}
      />
      ReactDom.render(<TotalCasesChart />, document.getElementById('total-cases'))

      let NewCasesChart = () => <Chart
        options={{
          chart: {
            type: 'column',
          },
          series: [
            {
              name: 'Daily new cases',
              data: seriesSet.newCases,
              findNearestPointBy: 'x'
            },
          ],
        }}
      />
      ReactDom.render(<NewCasesChart />, document.getElementById('new-cases'))
    }

    if (location.extra.current.deaths > 0) {
      let TotalDeathsChart = () => <Chart
        options={{
          chart: {
            type: 'line',
          },
          series: [
            {
              name: "Deaths (total)",
              data: seriesSet.totalDeaths,
            },
          ],
        }}
      />
      ReactDom.render(<TotalDeathsChart />, document.getElementById('total-deaths'))

      let NewDeathsChart = () => <Chart
        options={{
          chart: {
            type: 'column',
          },
          series: [
            {
              name: 'Daily deaths',
              data: seriesSet.newDeaths,
              findNearestPointBy: 'x'
            },
          ],
        }}
      />
      ReactDom.render(<NewDeathsChart />, document.getElementById('new-deaths'))
    }
  })
}

function getLiSeriesSet(location) {
  let localTimeseries = location.dates
  // "cases" => [0, 'counts'], "growthFactor" => [1, 'rates'], ...
  let keys = new Map
  let series = {
    counts: [],
    largeCounts: [],
    rates: [],
  }
  let dates = Object.keys(localTimeseries)
  dates.sort()
  for (let dateString of dates) {
    let date = dateStringToDate(dateString)
    let point = localTimeseries[dateString]
    for (let key of Object.keys(point)) {
      if (!keys.has(key)) {
        let chartId = (
          key === 'growthFactor' ? 'rates' :
            key === 'tested' ? 'largeCounts' :
              'counts')
        keys.set(key, [
          series[chartId].length,
          chartId // which chart
        ])
        series[chartId].push({
          name: key,
          data: []
        })
      }
      if (point[key] != null) {
        let [index, chartId] = keys.get(key)
        series[chartId][index].data.push([date, point[key]])
      }
    }
  }
  Object.values(series).map((s) => s.sort((a, b) => a.name.localeCompare(b.name)))
  return series
}

window.App.renderLi = renderLi
function renderLi() {
  $(() => {
    let { location } = getPayload()
    let series = getLiSeriesSet(location)

    let options

    for (let chartId of ['counts', 'largeCounts', 'rates']) {
      if (series[chartId].length) {
        let LiChart = () => <Chart
          options={{
            chart: {
              type: 'line',
            },
            plotOptions: {
              series: {
                marker: {
                  enabled: true,
                },
                label: false,
                lineWidth: 1,
                animation: false,
              }
            },
            title: {
              text: '',
            },
            series: series[chartId]
          }}
        />
        ReactDom.render(<LiChart />, document.getElementById(chartId))
      } else {
        $(`#${chartId}`).parent().remove()
      }
    }
  })
}
