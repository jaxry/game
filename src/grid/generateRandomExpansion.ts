import { hash2D, randomIndex } from '../util/util.ts'

export function generateRandomExpansion (cells: number) {
  const pointsHash = new Set<number>()
  const points: Point[] = []

  const potentialHash = new Set<number>()
  const potentialPoints: Point[] = []

  function addPotential (x: number, y: number) {
    const hash = hash2D(x, y)
    if (!pointsHash.has(hash) && !potentialHash.has(hash)) {
      potentialHash.add(hash)
      potentialPoints.push({ x, y })
    }
  }

  function addNeighbors ({ x, y }: Point) {
    addPotential(x - 1, y)
    addPotential(x + 1, y)
    addPotential(x, y - 1)
    addPotential(x, y + 1)
  }

  function addRandomPoint () {
    const point = deleteIndex(potentialPoints, randomIndex(potentialPoints))
    potentialHash.delete(hash2D(point.x, point.y))
    addNeighbors(point)

    pointsHash.add(hash2D(point.x, point.y))
    points.push(point)
  }

  points.push({ x: 0, y: 0 })
  addNeighbors(points[0])

  for (let i = 0; i < cells; i++) {
    addRandomPoint()
  }

  return points
}

interface Point {
  x: number
  y: number
}

function deleteIndex<T> (array: T[], index: number) {
  const value = array[index]

  if (index === array.length - 1) {
    array.pop()
  } else {
    array[index] = array.pop()!
  }

  return value
}