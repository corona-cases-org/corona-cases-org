import "highcharts";
import "highcharts/modules/series-label"
import "highcharts/modules/exporting"
import "highcharts/modules/export-data"
import "highcharts/modules/accessibility"

import { DataPoint } from "./models"

window.App = {}

window.App.render = render
function render(regionName, regionData) {
  $(() => {
    let previousTotalCases = null
    let newCasesSeries = []
    let totalCasesSeries = []
    let activeCasesSeries = []
    let deathsSeries = []
    let recoveriesSeries = []
    for (let i = 0; i < regionData.points.length; i++) {
      let point = new DataPoint(regionData.points[i])
      let date = point.getNativeDate()
      if (point.totalCases != null) {
        totalCasesSeries.push([date, point.totalCases])
        if (previousTotalCases != null) {
          newCasesSeries.push([date, point.totalCases - previousTotalCases])
        }
        let previousTotalCases = point.totalCases
      }
      if (point.deaths != null) {
        deathsSeries.push([date, point.deaths])
      }
      if (point.getActiveCases() != null) {
        activeCasesSeries.push([date, point.getActiveCases()])
      }
      if (point.recoveries != null) {
        recoveriesSeries.push([date, point.recoveries])
      }
    }

    let options
    options = getHighchartsOptions()
    options.chart.type = 'line'
    options.title.text = "Confirmed cases (total)"
    options.series = [
      {
        name: "Confirmed cases",
        data: totalCasesSeries,
      }
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
      enabled: false,
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

    colors: [/*'#6CF'*/ '#F88', '#39F', '#06C', '#036', '#000'],
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
