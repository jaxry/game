import Delaunator from 'delaunator'
import {
  connectZones,
  renderedConnectionDistance,
} from '../behavior/connections'
import { spawn } from '../behavior/spawn'
import type { GameObject } from '../GameObject'
import { makeType } from '../GameObject'
import poissonDiskSampling from './poissonDiskSampling'

const typeZone = makeType({
  name: `Somewhere, Someplace`,
  properNoun: true,
  description: `Somewhere and nowhere. Description of area. Each of these areas will eventually be unique.`,
  isContainer: true,
})

export function generateDelaunayZones(count: number) {
  let points = poissonDiskSampling(count)

  const edges: number[][] = []

  const {triangles, halfedges} = Delaunator.from(points, p => p.x, p => p.y)

  for (let i = 0; i < triangles.length; i++) {
    if (i > halfedges[i]) {
      const i1 = triangles[i]
      const i2 = triangles[i % 3 == 2 ? i - 2 : i + 1]
      const p1 = points[i1]
      const p2 = points[i2]
      const dx = p1.x - p2.x
      const dy = p1.y - p2.y
      if (Math.sqrt(dx * dx + dy * dy) < 2) {
        edges.push([i1, i2])
      }
    }
  }

  let zones: GameObject[] = []

  for (const point of points) {
    const zone = spawn(typeZone)
    zone.numSpots = 3 + Math.floor(Math.random() * 4)
    point.x *= renderedConnectionDistance
    point.y *= renderedConnectionDistance
    zone.position = point
    zones.push(zone)
  }

  for (const [i1, i2] of edges) {
    connectZones(zones[i1], zones[i2], false)
  }

  zones = zones.filter(zone => zone.connections)

  return zones
}

