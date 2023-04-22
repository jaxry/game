import GameObject from '../GameObject'
import { connectZones } from '../behavior/connections'
import Vertex from './Vertex'
import spawnZone from './spawnZone'

export default function makeZones (vertices: Vertex[]) {
  const vertexToZone = new Map<Vertex, GameObject>()

  for (const vertex of vertices) {
    const zone = spawnZone()
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