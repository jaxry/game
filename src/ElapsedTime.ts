export default class ElapsedTime {
  startTime: number
  lastTime: number

  constructor () {
    this.restart()
  }

  restart () {
    this.startTime = performance.now()
    this.lastTime = this.startTime
  }

  elapsedFromLast () {
    const now = performance.now()
    const elapsed = now - this.lastTime
    this.lastTime = now
    return elapsed
  }

  total () {
    return performance.now() - this.startTime
  }
}