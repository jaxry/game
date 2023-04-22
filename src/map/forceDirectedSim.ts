import { getZoneGraph } from '../behavior/connections'
import GameObject from '../GameObject'
import SpatialGrid from './SpatialGrid'
import { game } from '../Game'
import { clamp } from '../util'

const iterations = 300

// repelling force is this much stronger than attracting force
const repelRatio = 3000

const velocityDecay = 0.8
const alphaDecay = 0.985

const maxDistance = 2 * repelRatio
const maxDistance2 = maxDistance * maxDistance

export const renderedConnectionDistance = repelRatio / 20

export interface ForceDirectedSim {
  stop (): void
}

export function startForceDirectedSimulation (startingNode: GameObject,
    animate = false, alpha = 0.09): ForceDirectedSim {
  // higher alpha starts system with higher energy

  const graph = getZoneGraph(startingNode)
  const nodes = [...graph.nodes.keys()]
  const edges = [...graph.edges.values()]

  const grid = new SpatialGrid<GameObject>(2 * maxDistance)

  function repelNodes () {
    for (const node of nodes) {
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
            const dist2 = dx * dx + dy * dy
            if (dist2 > maxDistance2) {
              continue
            }
            const dist = Math.sqrt(dist2)
            const force = repelRatio / dist
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
      const force = dist
      const fx = alpha * force * dx / dist
      const fy = alpha * force * dy / dist
      source.position.vx += fx
      source.position.vy += fy
      target.position.vx -= fx
      target.position.vy -= fy
    }
  }

  function applyForces () {
    grid.clear()
    for (const node of nodes) {
      // add node to spatially partitioned grid
      grid.add(node.position, node)
    }

    repelNodes()
    attractConnectedNodes()
    alpha *= alphaDecay

    for (const node of nodes) {
      // clamp velocity to prevent instability
      node.position.vx = clamp(-repelRatio, repelRatio, node.position.vx)
      node.position.vy = clamp(-repelRatio, repelRatio, node.position.vy)

      // apply velocity
      node.position.x += node.position.vx
      node.position.y += node.position.vy

      // decay velocity
      node.position.vx *= velocityDecay
      node.position.vy *= velocityDecay
    }
  }

  let i = 0

  if (!animate) {
    while (i++ < iterations) {
      applyForces()
    }
    game.event.mapUpdate.emit()
    return {
      stop () {
      },
    }
  }

  let animationFrame: number

  function tick () {
    applyForces()

    game.event.mapPositionUpdate.emit()

    if (i++ < iterations) {
      animationFrame = requestAnimationFrame(tick)
    } else {
      console.log('done')
    }
  }

  tick()

  return {
    stop () {
      cancelAnimationFrame(animationFrame)
    },
  }
}