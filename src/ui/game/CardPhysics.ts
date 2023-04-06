import GameObject from '../../GameObject'
import Component from '../components/Component'
import { clamp, deleteElemFn } from '../../util'
import Point from '../../Point'

const velocityDecay = 0.995
const minVelocityBeforeStop = 1e-4
const repelForce = 0.0003
const minSimulationTime = 100

const attractionForce = repelForce * 2
const attractionDistance = 16

export default class CardPhysics {
  private animationId = 0
  private lastTime = 0
  private inactiveTime = 0
  private repelFromCenter: boolean
  private shouldRebuild = false

  private positions: Point[] = []
  private elements: HTMLElement[] = []
  private boundingBoxes: DOMRect[] = []

  private attractions: [GameObject, GameObject][] = []

  private ignoring = new WeakSet<GameObject>()

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
    this.simulate()
  }

  release (obj1: GameObject, obj2: GameObject) {
    const first = obj1.id < obj2.id ? obj1 : obj2
    const second = obj1.id < obj2.id ? obj2 : obj1
    deleteElemFn(this.attractions, ([a, b]) => a === first && b === second)
    this.simulate()
  }

  // Providing a new objectToCard updates the list of cards to simulate
  simulate (rebuild = false, repelFromCenter = false) {
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
    this.repelFromCenter = repelFromCenter
    this.animationId = requestAnimationFrame(this.tick)
  }

  private tick = () => {
    if (this.shouldRebuild) {
      this.rebuild()
      this.shouldRebuild = false
    }

    const time = performance.now()
    const elapsed = this.lastTime === 0 ? 16 : time - this.lastTime
    this.lastTime = time
    this.inactiveTime += elapsed

    const elapsed2 = elapsed * elapsed

    this.computeBoundingBoxes()

    this.repelFromCenter || this.attractions.length ?
        repelOverlappingFromCenters(
            this.positions, this.boundingBoxes, elapsed2) :
        repelOverlapping(
            this.positions, this.boundingBoxes, elapsed2)

    for (const [a, b] of this.attractions) {
      const r1 = rectFromPosition(a.position, this.objectToCard.get(a)!.element)
      const r2 = rectFromPosition(b.position, this.objectToCard.get(b)!.element)
      attract(a.position, r1, b.position, r2, elapsed2)
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
      freezeAll(this.positions)
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
    this.positions.length = 0
    this.elements.length = 0

    for (const [object, card] of this.objectToCard) {
      if (this.ignoring.has(object)) {
        continue
      }

      this.positions.push(object.position)
      this.elements.push(card.element)
    }

    this.attractions = this.attractions.filter(([a, b]) =>
        this.objectToCard.has(a) && this.objectToCard.has(b))
  }
}

function repelOverlappingFromCenters (
    positions: Point[], bBoxes: DOMRect[], elapsed: number) {
  for (let i = 0; i < positions.length; i++) {

    for (let j = i + 1; j < positions.length; j++) {

      const aBBox = bBoxes[i]
      const bBBox = bBoxes[j]

      if (intersects(aBBox, bBBox)) {
        const a = positions[i]
        const b = positions[j]

        const dx = a.x - b.x
        const dy = a.y - b.y
        const d = Math.sqrt(dx * dx + dy * dy)
        const f = repelForce * elapsed / d
        a.vx += f * dx
        a.vy += f * dy
        b.vx -= f * dx
        b.vy -= f * dy
      }
    }
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

        const { dx, dy } = rectDistance(a, aBBox, b, bBBox)

        let f = repelForce * elapsed

        // Move card to the closest edge to minimize distance traveled
        if (dx > dy) {
          f *= Math.sign(a.x - b.x)
          a.vx += f
          b.vx -= f
        } else {
          f *= Math.sign(a.y - b.y)
          a.vy += f
          b.vy -= f
        }
      }
    }
  }
}

function attract (
    a: Point, aBBox: DOMRect, b: Point, bBBox: DOMRect, elapsed: number) {

  const { dx, dy } = rectDistance(a, aBBox, b, bBBox)
  const dist = Math.max(dx, dy)
  const spring = clamp(-1, 1, (dist - attractionDistance) / attractionDistance)
  let f = attractionForce * spring * elapsed
  if (dx > dy) {
    f *= Math.sign(a.x - b.x)
    a.vx -= f
    b.vx += f
  } else {
    f *= Math.sign(a.y - b.y)
    a.vy -= f
    b.vy += f
  }
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

function freezeAll (positions: Point[]) {
  for (const p of positions) {
    p.vx = 0
    p.vy = 0
  }
}

function intersects (a: DOMRect, b: DOMRect) {
  return a.left < b.right &&
      b.left < a.right &&
      a.top < b.bottom &&
      b.top < a.bottom
}

function rectDistance (a: Point, aRect: DOMRect, b: Point, bRect: DOMRect) {
  return {
    dx: Math.abs(a.x - b.x) - (aRect.width + bRect.width) / 2,
    dy: Math.abs(a.y - b.y) - (aRect.height + bRect.height) / 2,
  }
}

// This method ignores transform scaling on an element,
// unlike getBoundingClientRect
function rectFromPosition (position: Point, element: HTMLElement) {
  const w = element.offsetWidth
  const h = element.offsetHeight
  return new DOMRect(position.x - w / 2, position.y - h / 2, w, h)
}