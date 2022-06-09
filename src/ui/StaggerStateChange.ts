export class StaggerStateChange {
  public duration = 1000

  private changes: (() => void)[] = []

  add (fn: () => void) {
    this.changes.push(fn)
  }

  start () {
    let delay = 0
    let time = this.duration / this.changes.length
    for (const change of this.changes) {
      setTimeout(change, delay)
      delay += time
    }
    this.changes.length = 0
  }
}