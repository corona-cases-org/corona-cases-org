import "highcharts";
import "highcharts/modules/series-label"
import "highcharts/modules/exporting"
import "highcharts/modules/export-data"
import "highcharts/modules/accessibility"
import moment from "moment/dist/moment"

window.App = {}

function dateStringToDate(dateString) {
  let m = moment(dateString, 'YYYY-MM-DD')
  return Date.UTC(m.year(), m.month(), m.date())
}

function getPayload() {
  return JSON.parse($('#payload').attr('data-payload'))
}

window.App.render = render
function render() {
  $(() => {
    let location = getPayload()
    let localTimeseries = location.dates
    let previousTotalCases = 0
    let newCasesSeries = []
    let totalCasesSeries = []
    let activeCasesSeries = []
    let deathsSeries = []
    let recoveredSeries = []
    let dates = Object.keys(localTimeseries)
    dates.sort()
    for (let dateString of dates) {
      let date = dateStringToDate(dateString)
      let point = localTimeseries[dateString]
      if (point.cases != null) {
        totalCasesSeries.push([date, point.cases])
        newCasesSeries.push([date, point.cases - previousTotalCases])
        previousTotalCases = point.cases
      }
      if (point.deaths != null) {
        deathsSeries.push([date, point.deaths])
      }
      if (point.active != null || point.cases != null) {
        let active = point.active != null ? point.active :
          (point.cases || 0) - (point.recovered || 0) - (point.deaths || 0)
        activeCasesSeries.push([date, active])
      }
      if (point.recovered != null) {
        recoveredSeries.push([date, point.recovered])
      }
    }

    let options
    options = getHighchartsOptions()
    options.chart.type = 'area' // line or area
    options.plotOptions.series.stacking = 'normal'
    options.title.text = "Confirmed cases (total)"
    // options.series = [
    //   {
    //     name: "Confirmed cases",
    //     data: activeCasesSeries,
    //   },
    //   {
    //     name: "Recoveries",
    //     data: recoveredSeries,
    //   },
    //   {
    //     name: "Deaths",
    //     data: deathsSeries,
    //   },
    // ]
    options.series = [
      {
        name: "Confirmed cases",
        data: totalCasesSeries,
      },
    ]
    Highcharts.chart('total-cases', options)

    options = getHighchartsOptions()
    options.chart.type = 'column'
    options.title.text = "Daily new confirmed cases"
    options.series = [
      {
        name: "New cases",
        data: newCasesSeries,
        findNearestPointBy: 'x'
      }
    ]
    Highcharts.chart('new-cases', options)
  })
}

window.App.renderLi = renderLi
function renderLi() {
  $(() => {
    let location = getPayload()
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

    let options

    for (let chartId of ['counts', 'largeCounts']) {
      if (series[chartId].length) {
        options = getHighchartsOptions()
        options.chart.type = 'line'
        // options.yAxis.type = 'logarithmic'
        options.plotOptions = {
          series: {
            marker: {
              enabled: true,
            },
            label: false,
            lineWidth: 1,
            animation: false,
          }
        }
        options.title = { text: '' }
        options.exporting = { enabled: false }
        options.series = series[chartId]
        Highcharts.chart(chartId, options)
      } else {
        $(`#${chartId}`).parent().remove()
      }
    }

    if (series.rates.length) {
      options = getHighchartsOptions()
      options.chart.type = 'line'
      // options.yAxis.type = 'logarithmic'
      options.plotOptions = {
        series: {
          marker: {
            enabled: true,
          },
          label: false,
          lineWidth: 1,
          animation: false,
        }
      }
      options.title = { text: '' }
      options.exporting = { enabled: false }
      options.series = series.rates
      Highcharts.chart('rates', options)
    } else {
      $('#rates').parent().remove()
    }
  })
}

function getHighchartsOptions() {
  return {
    chart: {
    },
    title: {
      text: '&nbsp;',
      useHTML: true,
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        month: '%e. %b',
        year: '%b',
      },
      gridLineWidth: 1,
      tickInterval: 7 * 24 * 3600 * 1000,
    },
    yAxis: {
      title: {
        text: undefined,
      },
      floor: 0,
      type: 'linear',
    },
    tooltip: {
    },
    legend: {
      // enabled: false,
    },

    plotOptions: {
      series: {
        marker: {
          enabled: false,
        },
        label: false,
        // step: 'left',
        animation: false,
        // stacking: 'normal',
      }
    },

    colors: ['#F88', '#39F', '#06C', '#036', '#000'],
  }
}
