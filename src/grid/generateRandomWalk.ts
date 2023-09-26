import { hash2D, randomElement } from '../util/util.ts'

export function generateRandomWalk (numPoints: number) {
  const hashToPoint = new Map<number, Point>()

  let x = 0
  let y = 0
  hashToPoint.set(hash2D(0, 0), { x, y })

  function randomStep () {
    const { dx, dy } = randomElement(directions)
    x += dx
    y += dy
    const hash = hash2D(x, y)
    if (!hashToPoint.has(hash)) {
      hashToPoint.set(hash, { x, y })
      return true
    }
    return false
  }

  for (let i = 1; i < numPoints;) {
    i += randomStep() ? 1 : 0
  }

  return hashToPoint.values()
}

const directions = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
]

interface Point {
  x: number
  y: number
}