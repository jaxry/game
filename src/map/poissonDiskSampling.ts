interface Point {
  x: number,
  y: number
}

export default function poissonDiskSampling(numPoints: number, minRadius = 1) {
  const points: Point[] = []
  const active: Point[] = []
  const grid = new Map<number, Point>()

  const maxRadius = minRadius * 2
  const diffRadius2 = maxRadius * maxRadius - minRadius * minRadius
  const minRadius2 = minRadius * minRadius
  const cellSize = minRadius / Math.SQRT2

  function sufficientRoom(x: number, y: number) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const existing = grid.get(
            hash(Math.floor(x / cellSize) + dx, Math.floor(y / cellSize) + dy))
        if (existing) {
          const dx = existing.x - x
          const dy = existing.y - y
          if (dx * dx + dy * dy < minRadius2) {
            return false
          }
        }
      }
    }
    return true
  }

  function tryAddingPoint() {
    const centerIndex = Math.floor(Math.random() * active.length)
    const center = active[centerIndex]

    for (let k = 0; k < 30; k++) {
      const r = Math.sqrt(minRadius2 + Math.random() * diffRadius2)
      const theta = 2 * Math.PI * Math.random()
      const x = center.x + r * Math.cos(theta)
      const y = center.y + r * Math.sin(theta)
      if (sufficientRoom(x, y)) {
        const p = { x, y }
        points.push(p)
        active.push(p)

        grid.set(hash(Math.floor(x / cellSize), Math.floor(y / cellSize)), p)
        return
      }
    }

    active.splice(centerIndex, 1)
  }

  const first = { x: 0, y: 0 }
  points.push(first)
  active.push(first)
  grid.set(0, first)

  while (points.length < numPoints) {
    if (active.length === 0) {
      return points
    }
    tryAddingPoint()
  }

  return points
}

// szudzik pairing function
function hash(x: number, y: number) {
  const a = x >= 0 ? 2 * x : -2 * x - 1.0
  const b = y >= 0 ? 2 * y : -2 * y - 1.0
  return a >= b ? a * a + a + b : b * b + a
}


