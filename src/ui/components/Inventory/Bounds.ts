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

  setSize (size: number) {
    this.left = -0.5 * size
    this.top = -0.5 * size
    this.right = 0.5 * size
    this.bottom = 0.5 * size
  }

  addBounds (b1: Bounds, b2: Bounds) {
    this.left = b1.left + b2.left
    this.top = b1.top + b2.top
    this.right = b1.right + b2.right
    this.bottom = b1.bottom + b2.bottom
    return this
  }

  subtractBounds (b1: Bounds, b2: Bounds) {
    this.left = b1.left - b2.left
    this.top = b1.top - b2.top
    this.right = b1.right - b2.right
    this.bottom = b1.bottom - b2.bottom
    return this
  }

  includePoint (x: number, y: number) {
    this.left = Math.min(this.left, x)
    this.top = Math.min(this.top, y)
    this.right = Math.max(this.right, x)
    this.bottom = Math.max(this.bottom, y)
  }

  width () {
    return this.right - this.left
  }

  height () {
    return this.bottom - this.top
  }
}