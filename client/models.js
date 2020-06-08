import moment from "moment/dist/moment"

export class DataPoint {
  constructor({ date, deaths, recoveries, totalCases }) {
    this.date = moment(date)
    this.deaths = deaths
    this.recoveries = recoveries
    this.totalCases = totalCases
  }

  getActiveCases() {
    if (this.totalCases == null) {
      return null
    } else {
      return this.totalCases - (this.deaths || 0) - (this.recoveries || 0)
    }
  }

  getNativeDate() {
    return Date.UTC(this.date.year(), this.date.month(), this.date.date())
  }
}
