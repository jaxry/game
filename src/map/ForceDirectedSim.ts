import { Edge, getZoneGraph } from '../behavior/connections'
import GameObject from '../GameObject'
import SpatialGrid from './SpatialGrid'
import { clamp } from '../util'

// repelling force is this much stronger than attracting force
const repelRatio = 6000

const velocityDecay = 1 - 1 / 2
const alphaDecay = 1

const stopVelocityScaled = repelRatio / 64
const maxVelocity = repelRatio / 4

const highStartAlpha = 1 / 12
const lowStartAlpha = highStartAlpha / 16

const maxDistance = repelRatio / 4
const maxDistance2 = maxDistance * maxDistance

export const renderedConnectionDistance = repelRatio / 10

export default class ForceDirectedSim {
  onUpdate?: () => void
  alpha: number
  private startingAlpha: number
  private grid: SpatialGrid<GameObject>
  private frozen = new Set<GameObject>()
  private nodes: GameObject[] = []
  private edges: Edge[] = []
  private currentAnimation: number | null = null

  simulateFully (startingNode: GameObject, highEnergy = true) {
    this.setAlpha(highEnergy ? highStartAlpha : lowStartAlpha)

    this.init(startingNode)

    while (this.applyForces()) {
    }

    this.onUpdate?.()
  }

  animate (startingNode: GameObject, highEnergy = false) {
    this.setAlpha(highEnergy ? highStartAlpha : lowStartAlpha)

    if (this.currentAnimation) {
      return
    }

    this.init(startingNode)

    const tick = () => {
      const repeat = this.applyForces()
      this.onUpdate?.()
      this.currentAnimation = repeat ? requestAnimationFrame(tick) : null
    }

    tick()
  }

  stop () {
    cancelAnimationFrame(this.currentAnimation!)
    this.currentAnimation = null
  }

  freeze (node: GameObject) {
    this.frozen.add(node)
  }

  unfreeze (node: GameObject) {
    this.frozen.delete(node)
  }

  private setAlpha (alpha: number) {
    this.alpha = alpha
    this.startingAlpha = alpha
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

    const highestVelocity = this.applyVelocity()
    this.setGridCenter()

    this.alpha *= alphaDecay

    return highestVelocity > stopVelocityScaled * this.startingAlpha
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

    let highestVelocity = 0

    for (const { position } of this.nodes) {
      // clamp velocity to prevent instability
      position.vx = clamp(-maxVelocity, maxVelocity, position.vx)
      position.vy = clamp(-maxVelocity, maxVelocity, position.vy)

      highestVelocity = Math.max(highestVelocity,
          position.vx * position.vx + position.vy * position.vy)

      // apply velocity
      position.x += position.vx
      position.y += position.vy

      // decay velocity
      position.vx *= velocityDecay
      position.vy *= velocityDecay
    }

    return Math.sqrt(highestVelocity)
  }
}