import { GameObject, makeType } from '../GameObject'
import { spawn } from '../behavior/spawn'
import { connectZones } from '../behavior/connections'
import { lerp } from '../util'
import { Vertex } from './types'

export default function makeZones(vertices: Vertex[]) {
  const vertexToZone = new Map<Vertex, GameObject>()

  for (const vertex of vertices) {
    const zone = spawn(typeZone)
    zone.numSpots = Math.round(lerp(1, 6, 3, 8, vertex.edges.length))
    if (vertex.position) {
      zone.position = vertex.position
    }
    vertexToZone.set(vertex, zone)
  }

  const visited = new Set<Vertex>()

  for (const vertex of vertices) {
    visited.add(vertex)
    const zone = vertexToZone.get(vertex)!
    for (const neighbor of vertex.edges) {
      if (visited.has(neighbor)) {
        continue
      }
      connectZones(zone, vertexToZone.get(neighbor)!)
    }
  }

  return [...vertexToZone.values()]
}

const typeZone = makeType({
  name: `Somewhere, Someplace`,
  properNoun: true,
  description: `Somewhere and nowhere. Description of area. Each of these areas will eventually be unique.`,
  isContainer: true,
})