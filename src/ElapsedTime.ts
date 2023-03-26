export default class ElapsedTime {
  startTime: number
  lastTime: number

  constructor () {
    this.start()
  }

  start () {
    this.startTime = performance.now()
    this.lastTime = this.startTime
  }

  elapsed () {
    const now = performance.now()
    const elapsed = now - this.lastTime
    this.lastTime = now
    return elapsed
  }

  total () {
    return performance.now() - this.startTime
  }
}