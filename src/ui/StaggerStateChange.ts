export default class StaggerStateChange {
  public wait = 200

  private changes: (() => void)[] = []

  private timeout?: number

  add (fn: () => void) {
    if (!this.timeout) {
      fn()
      this.timeout = setTimeout(this.next, this.wait)
    } else {
      this.changes.push(fn)
    }
  }

  private next = () => {
    if (this.changes.length) {
      this.changes.shift()!()
      this.timeout = setTimeout(this.next, this.wait)
    } else {
      this.timeout = undefined
    }
  }
}