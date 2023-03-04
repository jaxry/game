import { makeOrGet } from '../util'
import Position from '../Position'

export default class SpatialGrid<T> {
  grid = new Map<number, T[]>()

  constructor (public cellSize: number) {
  }

  add (position: Position, item: T) {
    const items = makeOrGet(this.grid,
        szudzikPairSigned(
            Math.floor(position.x / this.cellSize),
            Math.floor(position.y / this.cellSize)),
        () => [])

    items.push(item)
  }

  get (position: Position, offsetX = 0, offsetY = 0) {
    return this.grid.get(szudzikPairSigned(
        Math.floor(position.x / this.cellSize + offsetX),
        Math.floor(position.y / this.cellSize + offsetY)))
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
  const a = (x >= 0.0 ? 2.0 * x : (-2.0 * x) - 1.0)
  const b = (y >= 0.0 ? 2.0 * y : (-2.0 * y) - 1.0)
  return (a >= b ? (a * a) + a + b : (b * b) + a)
}