import GameObject from '../GameObject'
import { connectZones } from '../behavior/connections'
import Vertex from './Vertex'
import spawnZone from './spawnZone'
import { renderedConnectionDistance } from './ForceDirectedSim'

export default function makeZones (
    vertices: Vertex[], edges: [Vertex, Vertex][]) {
  const vertexToZone = new Map<Vertex, GameObject>()

  for (const vertex of vertices) {
    const zone = spawnZone()
    if (vertex.position) {
      zone.position.x = vertex.position.x * renderedConnectionDistance
      zone.position.y = vertex.position.y * renderedConnectionDistance
    }
    vertexToZone.set(vertex, zone)
  }

  for (const [a, b] of edges) {
    connectZones(vertexToZone.get(a)!, vertexToZone.get(b)!)
  }

  return [...vertexToZone.values()]
}