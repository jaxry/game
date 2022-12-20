export default class StaggerStateChange {
  totalTime = 500

  private changes: (() => void)[] = []

  add (fn: () => void) {
    this.changes.push(fn)
  }

  addToFront (fn: () => void) {
    this.changes.unshift(fn)
  }

  start = () => {
    const wait = this.totalTime / this.changes.length
    const next = () => {
      this.changes.shift()?.()
      if (this.changes.length) {
        setTimeout(next, wait)
      }
    }

    next()
  }

}