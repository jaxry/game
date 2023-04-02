import ElapsedTime from '../../ElapsedTime'
import GameObject from '../../GameObject'
import Component from '../components/Component'
import { clamp, deleteElemFn } from '../../util'

const velocityDecay = 0.995
const minVelocityBeforeStop = 1e-5
const repelForce = 0.0003
const minSimulationTime = 100

const attractionForce = repelForce * 2
const attractionDistance = 16

export default class CardPhysics {
  private animationId = 0

  private objects: GameObject[] = []
  private cards: Component[] = []

  private attractions: [GameObject, GameObject][] = []

  private ignoring = new WeakSet<GameObject>()

  constructor (
      public objectToCard: Map<GameObject, Component>,
      public onUpdate: () => void) {

  }

  // Providing a new objectToCard updates the list of cards to simulate
  simulate (rebuild = false, repelFromCenter = false) {
    if (rebuild) {
      // Objects might be added or removed since last simulation
      this.rebuild()
    } else if (this.animationId) {
      // Current simulation already running, nothing has changed.
      // Keep the value from repelFromCenter as is.
      return
    }

    const elapsedTime = new ElapsedTime()

    const tick = () => {
      const elapsed = Math.min(33, elapsedTime.elapsed())
      const elapsed2 = elapsed * elapsed

      repelFromCenter || this.attractions.length ?
          repelOverlappingFromCenters(
              this.objects, this.cards, elapsed2) :
          repelOverlapping(
              this.objects, this.cards, elapsed2)

      for (const [a, b] of this.attractions) {
        attract(
            a, this.objectToCard.get(a)!,
            b, this.objectToCard.get(b)!, elapsed2)
      }

      const repeat = applyVelocity(this.objects, elapsed)

      this.onUpdate()

      if (repeat || elapsedTime.total() < minSimulationTime) {
        this.animationId = requestAnimationFrame(tick)
      } else {
        this.animationId = 0
        freezeAll(this.objects)
      }
    }

    cancelAnimationFrame(this.animationId)
    this.animationId = requestAnimationFrame(tick)
  }

  ignore (object: GameObject) {
    this.ignoring.add(object)
    this.rebuild()
    this.simulate()
  }

  unignore (object: GameObject) {
    this.ignoring.delete(object)
    this.rebuild()
    this.simulate()
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

  private rebuild () {
    this.objects.length = 0
    this.cards.length = 0

    for (const [object, card] of this.objectToCard) {
      if (this.ignoring.has(object)) {
        continue
      }

      this.objects.push(object)
      this.cards.push(card)
    }

    this.attractions = this.attractions.filter(([a, b]) =>
        this.objectToCard.has(a) && this.objectToCard.has(b))
  }
}

function repelOverlappingFromCenters (
    objects: GameObject[], cards: Component[], elapsed: number) {
  for (let i = 0; i < objects.length; i++) {

    for (let j = i + 1; j < objects.length; j++) {

      const aBBox = cards[i].element.getBoundingClientRect()
      const bBBox = cards[j].element.getBoundingClientRect()

      if (intersects(aBBox, bBBox)) {
        const a = objects[i]
        const b = objects[j]

        const dx = a.position.x - b.position.x
        const dy = a.position.y - b.position.y
        const d = Math.sqrt(dx * dx + dy * dy)
        const f = repelForce * elapsed / d
        a.position.vx += f * dx
        a.position.vy += f * dy
        b.position.vx -= f * dx
        b.position.vy -= f * dy
      }
    }
  }
}

function repelOverlapping (
    objects: GameObject[], cards: Component[], elapsed: number) {
  for (let i = 0; i < objects.length; i++) {

    for (let j = i + 1; j < objects.length; j++) {

      const aBBox = cards[i].element.getBoundingClientRect()
      const bBBox = cards[j].element.getBoundingClientRect()

      if (intersects(aBBox, bBBox)) {
        const a = objects[i]
        const b = objects[j]

        const { dx, dy } = rectDistance(a, aBBox, b, bBBox)

        let f = repelForce * elapsed

        // Move card to the closest edge to minimize distance traveled
        if (dx > dy) {
          f *= Math.sign(a.position.x - b.position.x)
          a.position.vx += f
          b.position.vx -= f
        } else {
          f *= Math.sign(a.position.y - b.position.y)
          a.position.vy += f
          b.position.vy -= f
        }
      }
    }
  }
}


function attract (
    a: GameObject, aCard: Component, b: GameObject, bCard: Component,
    elapsed: number) {
  const aBBox = aCard.element.getBoundingClientRect()
  const bBBox = bCard.element.getBoundingClientRect()

  const { dx, dy } = rectDistance(a, aBBox, b, bBBox)
  const dist = Math.max(dx, dy)
  const spring = clamp(-1, 1, (dist - attractionDistance) / attractionDistance)
  let f = attractionForce * spring * elapsed
  if (dx > dy) {
    f *= Math.sign(a.position.x - b.position.x)
    a.position.vx -= f
    b.position.vx += f
  } else {
    f *= Math.sign(a.position.y - b.position.y)
    a.position.vy -= f
    b.position.vy += f
  }
}

function applyVelocity (objects: GameObject[], elapsed: number) {
  let repeat = false

  for (const object of objects) {
    object.position.vx *= velocityDecay ** elapsed
    object.position.vy *= velocityDecay ** elapsed
    object.position.x += object.position.vx
    object.position.y += object.position.vy
    const magnitude2 = object.position.vx * object.position.vx
        + object.position.vy * object.position.vy
    if (magnitude2 > minVelocityBeforeStop) {
      repeat = true
    }
  }
  return repeat
}

function freezeAll (objects: GameObject[]) {
  for (const object of objects) {
    object.position.vx = 0
    object.position.vy = 0
  }
}

function intersects (a: DOMRect, b: DOMRect) {
  return a.left < b.right &&
      b.left < a.right &&
      a.top < b.bottom &&
      b.top < a.bottom
}

function rectDistance (
    o1: GameObject, o1BBox: DOMRect,
    o2: GameObject, o2BBox: DOMRect) {
  return {
    dx: Math.abs(o1.position.x - o2.position.x)
        - (o1BBox.width + o2BBox.width) / 2,
    dy: Math.abs(o1.position.y - o2.position.y)
        - (o1BBox.height + o2BBox.height) / 2,
  }
}
