import Highcharts from "highcharts";
import * as React from "react"
import HighchartsReact from "highcharts-react-official"
import _ from "lodash"

export class Chart extends React.Component {
  getOptions() {
    let options = {
      chart: {
        animation: false
      },
      title: {
        text: null,
        useHTML: true,
      },
      xAxis: {
        crosshair: true,
        animation: false,
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
        minTickInterval: 1,
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
        }
      },

      colors: ['#C66', '#39F', '#06C', '#036', '#000'],
    }
    _.merge(options, this.props.options)
    return options
  }

  render() {
    return <HighchartsReact
      highcharts={Highcharts}
      options={this.getOptions()}
      containerProps={{ style: { height: "100%" } }}
    />
  }
}
