export class Timer {
  timeout: number | null = null
  startTime: number
  remainingTime: number

  constructor(public callback: () => void, public duration: number) {
    this.remainingTime = duration
    this.resume()
  }

  stop () {
    clearTimeout(this.timeout!)
    this.timeout = null
  }

  pause () {
    this.remainingTime -= Date.now() - this.startTime
    this.stop()
  }

  resume (remainingTime = this.remainingTime) {
    this.remainingTime = remainingTime
    this.startTime = Date.now()
    this.timeout = setTimeout(this.callback, this.remainingTime)
  }

  get active () {
    return this.timeout !== null
  }
}