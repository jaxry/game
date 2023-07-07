import GameObject from '../../../GameObject'
import Component from '../Component'
import { clamp, deleteElemFn, mapFilter, randomCentered } from '../../../util'
import Point from '../../../Point'
import { getDimensions } from '../../dimensionsCache'

const velocityDecay = 0.997
const minVelocityBeforeStop = 1e-4
const repelForce = 0.0001
const minSimulationTime = 100
const maxElapsedTime = 30

const attractionForce = 3 * repelForce
const attractionDistance = 16

export default class CardPhysics {
  private animationId = 0
  private lastTime = 0
  private inactiveTime = 0
  private shouldRebuild = false

  private positions: Point[] = []
  private elements: HTMLElement[] = []
  private boundingBoxes: DOMRect[] = []

  private attractions: [GameObject, GameObject][] = []
  private attractionIndices: [number, number][] = []

  private ignoring = new Set<GameObject>()

  constructor (
      public objectToCard: Map<GameObject, Component>,
      public onUpdate: () => void) {

  }

  ignore (object: GameObject) {
    this.ignoring.add(object)
    this.simulate(true)
  }

  unignore (object: GameObject) {
    this.ignoring.delete(object)
    this.simulate(true)
  }

  attract (obj1: GameObject, obj2: GameObject) {
    const first = obj1.id < obj2.id ? obj1 : obj2
    const second = obj1.id < obj2.id ? obj2 : obj1
    if (this.attractions.find(([a, b]) => a === first && b === second)) {
      return
    }
    this.attractions.push([first, second])
    this.simulate(true)
  }

  release (obj1: GameObject, obj2: GameObject) {
    const first = obj1.id < obj2.id ? obj1 : obj2
    const second = obj1.id < obj2.id ? obj2 : obj1
    deleteElemFn(this.attractions, ([a, b]) => a === first && b === second)
    this.simulate(true)
  }

  // Providing a new objectToCard updates the list of cards to simulate
  simulate (rebuild = false) {
    // card was added or removed and arrays need to be rebuilt next tick
    if (rebuild) {
      this.shouldRebuild = true
    }

    if (this.animationId) {
      // Current simulation already running, nothing has changed.
      // Keep the value from repelFromCenter as is.
      return
    }

    this.lastTime = 0
    this.animationId = requestAnimationFrame(this.tick)
  }

  private tick = () => {
    if (this.shouldRebuild) {
      this.rebuild()
      this.shouldRebuild = false
    }

    const time = performance.now()
    const elapsed = Math.min(maxElapsedTime,
        this.lastTime === 0 ? 16 : time - this.lastTime)
    this.lastTime = time
    this.inactiveTime += elapsed

    const elapsed2 = elapsed * elapsed

    this.computeBoundingBoxes()

    repelOverlapping(this.positions, this.boundingBoxes, elapsed2)

    for (const [i, j] of this.attractionIndices) {
      attract(this.positions[i], this.boundingBoxes[i],
          this.positions[j], this.boundingBoxes[j], elapsed2)
    }

    for (const object of this.ignoring) {
      object.position.vx = 0
      object.position.vy = 0
    }

    const repeat = applyVelocity(this.positions, elapsed)

    this.onUpdate()

    if (repeat) {
      this.inactiveTime = 0
      this.animationId = requestAnimationFrame(this.tick)
    } else if (this.inactiveTime < minSimulationTime) {
      this.animationId = requestAnimationFrame(this.tick)
    } else {
      this.animationId = 0
    }
  }

  // caching bounding boxes improves performance by ~2x
  private computeBoundingBoxes () {
    for (let i = 0; i < this.positions.length; i++) {
      this.boundingBoxes[i] = rectFromPosition(
          this.positions[i], this.elements[i])
    }
  }

  private rebuild () {
    this.positions = mapFilter(this.objectToCard.keys(),
        object => object.position)
    this.elements = mapFilter(this.objectToCard.values(),
        card => card.element)

    this.attractions = this.attractions.filter(([a, b]) =>
        this.objectToCard.has(a) && this.objectToCard.has(b))

    this.attractionIndices = mapFilter(this.attractions, ([a, b]) => [
      this.positions.indexOf(a.position),
      this.positions.indexOf(b.position),
    ])
  }
}

function repelOverlapping (
    positions: Point[], bBoxes: DOMRect[], elapsed: number) {
  for (let i = 0; i < positions.length; i++) {

    for (let j = i + 1; j < positions.length; j++) {

      const aBBox = bBoxes[i]
      const bBBox = bBoxes[j]

      if (intersects(aBBox, bBBox)) {
        const a = positions[i]
        const b = positions[j]
        addForce(a, b, repelForce * elapsed)
      }
    }
  }
}

function attract (
    a: Point, aBBox: DOMRect, b: Point, bBBox: DOMRect, elapsed: number) {

  const { width, height } = rectDistance(aBBox, bBBox)
  const dist = Math.max(width, height)
  const spring = clamp(-1, 1, (dist - attractionDistance) / attractionDistance)
  addForce(a, b, -spring * attractionForce * elapsed)
}

function addForce (a: Point, b: Point, force: number) {
  // add small random jitter so forces work on objects in the same position
  const dx = a.x - b.x + randomCentered(1e-10)
  const dy = a.y - b.y + randomCentered(1e-10)
  const d = Math.sqrt(dx * dx + dy * dy)
  const f = force / d
  a.vx += f * dx
  a.vy += f * dy
  b.vx -= f * dx
  b.vy -= f * dy
}

function applyVelocity (positions: Point[], elapsed: number) {
  let repeat = false

  for (const p of positions) {
    p.vx *= velocityDecay ** elapsed
    p.vy *= velocityDecay ** elapsed
    p.x += p.vx
    p.y += p.vy
    const magnitude2 = p.vx * p.vx + p.vy * p.vy
    if (magnitude2 > minVelocityBeforeStop) {
      repeat = true
    }
  }
  return repeat
}

function intersects (a: DOMRect, b: DOMRect) {
  return a.left < b.right &&
      b.left < a.right &&
      a.top < b.bottom &&
      b.top < a.bottom
}

function rectDistance (aRect: DOMRect, bRect: DOMRect) {
  const acx = aRect.left + 0.5 * aRect.width
  const acy = aRect.top + 0.5 * aRect.height
  const bcx = bRect.left + 0.5 * bRect.width
  const bcy = bRect.top + 0.5 * bRect.height
  return {
    width: Math.abs(acx - bcx) - (aRect.width + bRect.width) / 2,
    height: Math.abs(acy - bcy) - (aRect.height + bRect.height) / 2,
  }
}

// This method ignores transform scaling on an element,
// unlike getBoundingClientRect
function rectFromPosition (position: Point, element: HTMLElement) {
  const { width, height } = getDimensions(element)
  return new DOMRect(position.x - width / 2, position.y - height / 2,
      width, height)
}