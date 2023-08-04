import { Edge, getZoneGraph } from '../behavior/connections'
import GameObject from '../GameObject'
import SpatialGrid from './SpatialGrid'
import { clamp } from '../util'

// repelling force is this much stronger than attracting force
const repelRatio = 5000

const velocityDecay = 1 - 1 / 32
const alphaDecay = 1

const minVelocityScaled = repelRatio / 8
const maxVelocity = repelRatio / 8

const highStartAlpha = 1 / 2048
const lowStartAlpha = highStartAlpha / 16

const maxDistance = repelRatio / 4
const maxDistance2 = maxDistance * maxDistance

const defaultElapsedTime = 17

export const renderedConnectionDistance = repelRatio / 8

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

    while (this.applyForces(defaultElapsedTime)) {
    }

    this.onUpdate?.()
  }

  animate (startingNode: GameObject, highEnergy = false) {
    this.setAlpha(highEnergy ? highStartAlpha : lowStartAlpha)

    if (this.currentAnimation) {
      return
    }

    this.init(startingNode)

    let lastTime = 0

    const tick = (time: number) => {
      const elapsed = lastTime ?
          Math.min(time - lastTime, defaultElapsedTime) : defaultElapsedTime
      lastTime = time

      const repeat = this.applyForces(elapsed)
      this.onUpdate?.()
      this.currentAnimation = repeat ? requestAnimationFrame(tick) : null
    }

    tick(0)
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

  private applyForces (elapsed: number) {
    this.grid.clear()
    for (const node of this.nodes) {
      // add node to spatially partitioned grid
      this.grid.add(node.position, node)
    }

    const elapsed2 = elapsed * elapsed
    this.repelNodes(elapsed2)
    this.attractConnectedNodes(elapsed2)

    const highestVelocity = this.applyVelocity(elapsed)
    this.setGridCenter()

    this.alpha *= alphaDecay ** elapsed

    return highestVelocity > minVelocityScaled * this.startingAlpha
  }

  private repelNodes (elapsed: number) {
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
            const fx = this.alpha * elapsed * force * force * dx / dist
            const fy = this.alpha * elapsed * force * force * dy / dist
            node.position.vx -= fx
            node.position.vy -= fy
            other.position.vx += fx
            other.position.vy += fy
          }
        }
      }
    }
  }

  private attractConnectedNodes (elapsed: number) {
    for (const { source, target } of this.edges) {
      const dx = target.position.x - source.position.x
      const dy = target.position.y - source.position.y
      const fx = this.alpha * elapsed * dx
      const fy = this.alpha * elapsed * dy
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

  private applyVelocity (elapsed: number) {
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
      position.vx *= velocityDecay ** elapsed
      position.vy *= velocityDecay ** elapsed
    }

    return Math.sqrt(highestVelocity) / elapsed
  }
}