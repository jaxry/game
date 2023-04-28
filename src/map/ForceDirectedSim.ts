import { Edge, getZoneGraph } from '../behavior/connections'
import GameObject from '../GameObject'
import SpatialGrid from './SpatialGrid'
import { game } from '../Game'
import { clamp } from '../util'

const iterations = 300

// repelling force is this much stronger than attracting force
const repelRatio = 3000

const velocityDecay = 0.8
const alphaDecay = 0.985

const maxDistance = repelRatio
const maxDistance2 = maxDistance * maxDistance

export const renderedConnectionDistance = repelRatio / 12

export default class ForceDirectedSim {
  grid: SpatialGrid<GameObject>
  nodes: GameObject[] = []
  edges: Edge[] = []

  alpha: number

  constructor () {

  }

  start (startingNode: GameObject) {
    this.alpha = 0.09
    const graph = getZoneGraph(startingNode)

    this.nodes = [...graph.nodes.keys()]
    this.edges = [...graph.edges.values()]
    this.grid = new SpatialGrid<GameObject>(2 * maxDistance)

    let i = 0
    const tick = () => {
      while (i++ < iterations) {
        this.applyForces()
      }
      game.event.mapUpdate.emit()
    }

    // function tickAnimated () {
    //   applyForces()
    //
    //   game.event.mapPositionUpdate.emit()
    //
    //   if (i++ < iterations) {
    //     requestAnimationFrame(tickAnimated)
    //   } else {
    //     game.event.mapUpdate.emit()
    //   }
    // }

    tick()
  }

  private applyForces () {
    this.grid.clear()
    for (const node of this.nodes) {
      // add node to spatially partitioned grid
      this.grid.add(node.position, node)
    }

    repelNodes(this.nodes, this.grid, this.alpha)
    attractConnectedNodes(this.edges, this.alpha)
    this.alpha *= alphaDecay

    applyVelocity(this.nodes)
    setGridCenter(this.nodes, this.grid)
  }
}

function repelNodes (
    nodes: GameObject[], grid: SpatialGrid<GameObject>, alpha: number) {
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

function attractConnectedNodes (edges: Edge[], alpha: number) {
  for (const { source, target } of edges) {
    const dx = target.position.x - source.position.x
    const dy = target.position.y - source.position.y
    const fx = alpha * dx
    const fy = alpha * dy
    source.position.vx += fx
    source.position.vy += fy
    target.position.vx -= fx
    target.position.vy -= fy
  }
}

function setGridCenter (nodes: GameObject[], grid: SpatialGrid<GameObject>) {
  grid.center.x = 0
  grid.center.y = 0
  for (const node of nodes) {
    grid.center.x += node.position.x
    grid.center.y += node.position.y
  }
  grid.center.x /= nodes.length
  grid.center.y /= nodes.length
}

function applyVelocity (nodes: GameObject[]) {
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