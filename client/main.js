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

window.App.render = render
function render(location, localTimeseries) {
  $(() => {
    let previousTotalCases = null
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
        if (previousTotalCases != null) {
          newCasesSeries.push([date, point.cases - previousTotalCases])
        }
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
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          plotOptions: {
            series: {
              marker: {
                radius: 2.5
              }
            }
          }
        }
      }]
    }
  }
}
