import { getZoneGraph } from '../behavior/connections'
import GameObject from '../GameObject'
import SpatialGrid from './SpatialGrid'
import { game } from '../Game'

// gets the default d3 node distance
export const renderedConnectionDistance = 100

export function startForceDirectedSimulation (startingNode: GameObject) {

  // higher alpha starts system with higher energy but leads to instability
  let alpha = 0.9

  // repelling force is this much stronger than attracting force
  const repelRatio = 80

  const velocityDecay = 0.5
  const alphaDecay = 0.999
  const maxForceDistance = 10

  const graph = getZoneGraph(startingNode)
  const nodes = [...graph.nodes.keys()]
  const edges = [...graph.edges.values()]
  const grid = new SpatialGrid<GameObject>(maxForceDistance *
      renderedConnectionDistance)

  function repelNodes () {
    for (const node of nodes) {
      // randomly jitter to disrupt stuck positions
      node.position.vx += alpha * (Math.random() - 0.5)
      node.position.vy += alpha * (Math.random() - 0.5)

      // get 2x2 spatially partitioned grid cells closest to node
      for (let dx = 0; dx <= 1; dx++) {
        for (let dy = 0; dy <= 1; dy++) {
          const otherNodes = grid.get(node.position, -0.5 + dx, -0.5 + dy)

          if (!otherNodes) continue

          for (const other of otherNodes) {
            if (other.id <= node.id) {
              // already handled this pair
              continue
            }
            const dx = other.position.x - node.position.x
            const dy = other.position.y - node.position.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            let force = repelRatio / dist
            const fx = alpha * force * force * dx / dist
            const fy = alpha * force * force * dy / dist
            node.position.vx -= fx
            node.position.vy -= fy
            other.position.vx += fx
            other.position.vy += fy
          }
        }
      }
    }
  }

  function attractConnectedNodes () {
    for (const { source, target } of edges) {
      const dx = target.position.x - source.position.x
      const dy = target.position.y - source.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const force = dist - renderedConnectionDistance
      const fx = alpha * force * dx / dist
      const fy = alpha * force * dy / dist
      source.position.vx += fx
      source.position.vy += fy
      target.position.vx -= fx
      target.position.vy -= fy
    }
  }

  function tick () {
    repelNodes()
    attractConnectedNodes()
    alpha *= alphaDecay
    grid.clear()

    for (const node of nodes) {
      // decay velocity
      node.position.vx *= velocityDecay
      node.position.vy *= velocityDecay

      // apply velocity
      node.position.x += node.position.vx
      node.position.y += node.position.vy

      // add node to spatially partitioned grid
      grid.add(node.position, node)
    }

    game.event.mapUpdated.emit()

    requestAnimationFrame(tick)
  }

  tick()
}