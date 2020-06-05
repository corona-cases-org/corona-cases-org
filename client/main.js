import "highcharts";
import "highcharts/modules/series-label"
import "highcharts/modules/exporting"
import "highcharts/modules/export-data"
import "highcharts/modules/accessibility"
import moment from "moment/dist/moment"

$(() => {
  let { region, regionData } = window.backendData;
  let dataSet = regionData.dataSet;
  let caseSeries = []
  for (let i = 0; i < dataSet.points.length; i++) {
    let point = dataSet.points[i];
    let date = moment(point.date)
    if (point.totalCases != null) {
      caseSeries.push([Date.UTC(date.year(), date.month(), date.date()), point.totalCases])
    }
  }

  Highcharts.chart('container', {
    chart: {
      type: 'area'
    },
    title: {
      text: undefined
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: { // don't display the dummy year
        month: '%e. %b',
        year: '%b'
      },
      title: {
        text: 'Date'
      }
    },
    yAxis: {
      title: {
        text: undefined
      },
      floor: 0,
      type: 'linear',
    },
    tooltip: {
    },

    plotOptions: {
      series: {
        marker: {
          enabled: false
        },
        label: false,
        // step: 'left',
      }
    },

    colors: [/*'#6CF'*/ '#F88', '#39F', '#06C', '#036', '#000'],

    series: [{
      name: "Confirmed cases",
      data: caseSeries
    }],

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
  });
})
