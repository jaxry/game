export default class Timer {
  timeout?: number
  startTime = 0
  endTime = 0

  get remainingTime () {
    return Math.max(0, this.endTime - performance.now())
  }

  get isRunning () {
    return this.timeout && this.remainingTime > 0
  }

  get isFinished () {
    return !this.isRunning
  }

  start (callback: () => void, duration = 0) {
    this.stop()
    this.startTime = performance.now()
    this.endTime = this.startTime + duration
    this.timeout = setTimeout(callback, duration)
    return this
  }

  stop () {
    if (!this.timeout) return
    clearTimeout(this.timeout)
    this.timeout = undefined
    return this
  }
}