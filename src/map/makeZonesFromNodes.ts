import GameObject from '../GameObject'
import { connectZones } from '../behavior/connections'
import Node from './Node'
import spawnZone from './spawnZone'
import { renderedConnectionDistance } from './ForceDirectedSim'

export default function makeZonesFromNodes (
    nodes: Node[], edges: [Node, Node][]) {
  const nodeToZone = new Map<Node, GameObject>()

  for (const node of nodes) {
    const zone = spawnZone()
    if (node.position) {
      zone.position.x = node.position.x * renderedConnectionDistance
      zone.position.y = node.position.y * renderedConnectionDistance
    }
    nodeToZone.set(node, zone)
  }

  for (const [a, b] of edges) {
    connectZones(nodeToZone.get(a)!, nodeToZone.get(b)!)
  }

  return [...nodeToZone.values()]
}