export default class ElapsedTime {
  lastTime: number

  constructor() {
    this.start()
  }

  start () {
    this.lastTime = performance.now()
  }

  elapsed () {
    const now = performance.now()
    const elapsed = now - this.lastTime
    this.lastTime = now
    return elapsed
  }
}