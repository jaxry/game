export default class Bounds {
  left = 0
  right = 0
  top = 0
  bottom = 0

  reset () {
    this.left = Infinity
    this.top = Infinity
    this.right = -Infinity
    this.bottom = -Infinity
  }

  expand (amount: number) {
    this.left -= amount
    this.top -= amount
    this.right += amount
    this.bottom += amount
  }

  setMinSize (size: number) {
    this.left = Math.min(isFinite(this.left) ? this.left : 0, -size)
    this.top = Math.min(isFinite(this.top) ? this.top : 0, -size)
    this.right = Math.max(isFinite(this.right) ? this.right : 0, size)
    this.bottom = Math.max(isFinite(this.bottom) ? this.bottom : 0, size)
  }

  extendLeft (x: number) {
    this.left = Math.min(this.left, x)
  }

  extendTop (y: number) {
    this.top = Math.min(this.top, y)
  }

  extendRight (x: number) {
    this.right = Math.max(this.right, x)
  }

  extendBottom (y: number) {
    this.bottom = Math.max(this.bottom, y)
  }

  width () {
    return this.right - this.left
  }

  height () {
    return this.bottom - this.top
  }
}