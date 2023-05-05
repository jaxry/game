import GameObject from '../GameObject'
import { connectZones } from '../behavior/connections'
import Vertex from './Vertex'
import spawnZone from './spawnZone'

export default function makeZones (
    vertices: Vertex[], edges: [Vertex, Vertex][]) {
  const vertexToZone = new Map<Vertex, GameObject>()

  for (const vertex of vertices) {
    vertexToZone.set(vertex, spawnZone())
  }

  for (const [a, b] of edges) {
    connectZones(vertexToZone.get(a)!, vertexToZone.get(b)!)
  }

  return [...vertexToZone.values()]
}