import { Edge, getZoneGraph } from '../behavior/connections'
import GameObject from '../GameObject'
import SpatialGrid from './SpatialGrid'
import { clamp } from '../util'

// repelling force is this much stronger than attracting force
const repelRatio = 3000

const velocityDecay = 0.9
const alphaDecay = 0.985

const minVelocity = 0.015

const highStartAlpha = 0.09
const lowStartAlpha = 0.005

const maxDistance = repelRatio
const maxDistance2 = maxDistance * maxDistance

export const renderedConnectionDistance = repelRatio / 12

export default class ForceDirectedSim {
  onUpdate?: () => void
  private grid: SpatialGrid<GameObject>
  private frozen = new Set<GameObject>()
  private nodes: GameObject[] = []
  private edges: Edge[] = []
  private currentAnimation: number | null = null

  alpha: number

  constructor () {

  }

  simulateFully (startingNode: GameObject, alpha = highStartAlpha) {
    this.alpha = alpha
    this.init(startingNode)
    while (this.applyForces() > minVelocity) {
    }
    this.onUpdate?.()
  }

  animate (startingNode: GameObject, alpha = lowStartAlpha) {
    this.alpha = alpha

    if (this.currentAnimation) {
      return
    }

    this.init(startingNode)

    const tick = () => {
      const maxVelocity = this.applyForces()
      this.onUpdate?.()
      this.currentAnimation = maxVelocity > minVelocity ?
          requestAnimationFrame(tick) : null
    }

    tick()
  }

  freeze (node: GameObject) {
    this.frozen.add(node)
  }

  unfreeze (node: GameObject) {
    this.frozen.delete(node)
  }

  private init (startingNode: GameObject) {
    const graph = getZoneGraph(startingNode)

    this.nodes = [...graph.nodes.keys()]
    this.edges = [...graph.edges.values()]
    this.grid = new SpatialGrid<GameObject>(2 * maxDistance)
  }

  private applyForces () {
    this.grid.clear()
    for (const node of this.nodes) {
      // add node to spatially partitioned grid
      this.grid.add(node.position, node)
    }

    this.repelNodes()
    this.attractConnectedNodes()
    this.alpha *= alphaDecay

    const maxVelocity = this.applyVelocity()
    this.setGridCenter()

    return maxVelocity
  }

  private repelNodes () {
    for (const node of this.nodes) {
      // get 2x2 spatially partitioned grid cells closest to node
      for (let dx = 0; dx <= 1; dx++) {
        for (let dy = 0; dy <= 1; dy++) {
          const otherNodes = this.grid.get(node.position, -0.5 + dx, -0.5 + dy)

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
            const fx = this.alpha * force * force * dx / dist
            const fy = this.alpha * force * force * dy / dist
            node.position.vx -= fx
            node.position.vy -= fy
            other.position.vx += fx
            other.position.vy += fy
          }
        }
      }
    }
  }

  private attractConnectedNodes () {
    for (const { source, target } of this.edges) {
      const dx = target.position.x - source.position.x
      const dy = target.position.y - source.position.y
      const fx = this.alpha * dx
      const fy = this.alpha * dy
      source.position.vx += fx
      source.position.vy += fy
      target.position.vx -= fx
      target.position.vy -= fy
    }
  }

  private setGridCenter () {
    this.grid.center.x = 0
    this.grid.center.y = 0
    for (const { position } of this.nodes) {
      this.grid.center.x += position.x
      this.grid.center.y += position.y
    }
    this.grid.center.x /= this.nodes.length
    this.grid.center.y /= this.nodes.length
  }

  private applyVelocity () {
    for (const { position } of this.frozen) {
      position.vx = 0
      position.vy = 0
    }

    let maxVelocity = 0

    for (const { position } of this.nodes) {
      // clamp velocity to prevent instability
      position.vx = clamp(-repelRatio, repelRatio, position.vx)
      position.vy = clamp(-repelRatio, repelRatio, position.vy)

      maxVelocity = Math.max(maxVelocity,
          position.vx * position.vx + position.vy * position.vy)

      // apply velocity
      position.x += position.vx
      position.y += position.vy

      // decay velocity
      position.vx *= velocityDecay
      position.vy *= velocityDecay
    }

    return maxVelocity
  }
}