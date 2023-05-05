import { makeOrGet } from '../util'
import Point from '../Point'

export default class SpatialGrid<T> {
  center = new Point(0, 0)

  private grid = new Map<number, T[]>()

  constructor (public cellSize: number) {
  }

  add (position: Point, item: T) {
    const items = makeOrGet(this.grid,
        szudzikPairSigned(
            Math.floor((position.x - this.center.x) / this.cellSize),
            Math.floor((position.y - this.center.y) / this.cellSize)),
        () => [])

    items.push(item)
  }

  get (position: Point, offsetX = 0, offsetY = 0) {
    return this.grid.get(szudzikPairSigned(
        Math.floor((position.x - this.center.x) / this.cellSize + offsetX),
        Math.floor((position.y - this.center.y) / this.cellSize + offsetY)))
  }

  clear () {
    for (const [key, items] of this.grid) {
      if (items.length === 0) {
        this.grid.delete(key)
      } else {
        items.length = 0
      }
    }
  }
}

function szudzikPairSigned (x: number, y: number) {
  const a = (x >= 0.0 ? 2.0 * x : (-2.0 * x) - 1.0)
  const b = (y >= 0.0 ? 2.0 * y : (-2.0 * y) - 1.0)
  return (a >= b ? (a * a) + a + b : (b * b) + a)
}