import { makeOrGet } from '../util'

export default class SpatialGrid<T> {
  grid = new Map<number, T[]>()
  constructor (public gridSize: number) {}

  index (number: number) {
    return Math.floor(number / this.gridSize)
  }

  add (x: number, y: number, item: T) {
    const items = makeOrGet(this.grid,
        szudzikPairSigned(this.index(x), this.index(y)),
        () => [])
    items.push(item)
  }

  get (x: number, y: number, offsetX = 0, offsetY = 0) {
    return this.grid.get(szudzikPairSigned(this.index(x) + offsetX, this.index(y) + offsetY))
  }

  clear () {
    for (const [key, items] of this.grid.entries()) {
      if (items.length === 0) {
        this.grid.delete(key)
      } else {
        items.length = 0
      }
    }
  }
}

function szudzikPairSigned (x: number, y: number) {
  const a = (x >= 0.0 ? 2.0 * x : (-2.0 * x) - 1.0);
  const b = (y >= 0.0 ? 2.0 * y : (-2.0 * y) - 1.0);
  return (a >= b ? (a * a) + a + b : (b * b) + a);
}