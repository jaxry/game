import ElapsedTime from '../../ElapsedTime'
import GameObject from '../../GameObject'
import Component from '../components/Component'

export default class CardPhysics {
  repelForce = 0.001
  velocityDecay = 0.995
  minVelocityBeforeStop = 1e-5
  minSimulationTime = 100

  private animationId = 0
  private ignoring = new WeakSet<GameObject>()

  private objects: GameObject[]
  private cards: Component[]

  constructor (
      public onUpdate: () => void) {

  }

  // providing a new objectToCard updates the list of cards to simulate
  simulate (
      objectToCard?: Map<GameObject, Component>, repelFromCenter = false) {
    if (objectToCard) {
      // objects might be added or removed since last simulation
      this.objects = [...objectToCard.keys()]
      this.cards = [...objectToCard.values()]
    } else if (this.animationId) {
      // current simulation already running, nothing has changed
      return
    }

    const elapsedTime = new ElapsedTime()

    const tick = () => {
      const elapsed = elapsedTime.elapsed()

      repelFromCenter ?
          this.repelOverlappingFromCenters(elapsed) :
          this.repelOverlapping(elapsed)

      const repeat = this.applyVelocity(elapsed)

      this.onUpdate()

      if (repeat || elapsedTime.total() < this.minSimulationTime) {
        this.animationId = requestAnimationFrame(tick)
      } else {
        this.animationId = 0
        this.freeze()
      }
    }

    cancelAnimationFrame(this.animationId)
    this.animationId = requestAnimationFrame(tick)
  }

  ignore (object: GameObject, ignore: boolean) {
    if (ignore) {
      object.position.vx = 0
      object.position.vy = 0
      this.ignoring.add(object)
    } else {
      this.ignoring.delete(object)
    }
  }

  private repelOverlapping (elapsed: number) {
    for (let i = 0; i < this.objects.length; i++) {

      if (this.ignoring.has(this.objects[i])) continue

      for (let j = i + 1; j < this.objects.length; j++) {

        if (this.ignoring.has(this.objects[j])) continue

        const aBBox = this.cards[i].element.getBoundingClientRect()
        const bBBox = this.cards[j].element.getBoundingClientRect()

        if (intersects(aBBox, bBBox)) {
          const a = this.objects[i]
          const b = this.objects[j]

          // move card to the closest edge to minimize distance traveled
          const xOverlap = Math.abs(a.position.x - b.position.x)
              - (aBBox.width + bBBox.width) / 2
          const yOverlap = Math.abs(a.position.y - b.position.y)
              - (aBBox.height + bBBox.height) / 2
          const f = this.repelForce * elapsed

          if (xOverlap > yOverlap) {
            const dir = f * Math.sign(a.position.x - b.position.x)
            a.position.vx += dir
            b.position.vx -= dir
          } else {
            const dir = f * Math.sign(a.position.y - b.position.y)
            a.position.vy += dir
            b.position.vy -= dir
          }
        }
      }
    }
  }

  private repelOverlappingFromCenters (elapsed: number) {
    for (let i = 0; i < this.objects.length; i++) {

      if (this.ignoring.has(this.objects[i])) continue

      for (let j = i + 1; j < this.objects.length; j++) {

        if (this.ignoring.has(this.objects[j])) continue

        const aBBox = this.cards[i].element.getBoundingClientRect()
        const bBBox = this.cards[j].element.getBoundingClientRect()

        if (intersects(aBBox, bBBox)) {
          const a = this.objects[i]
          const b = this.objects[j]

          const dx = a.position.x - b.position.x
          const dy = a.position.y - b.position.y
          const d = Math.sqrt(dx * dx + dy * dy)
          const f = this.repelForce * elapsed / d
          a.position.vx += f * dx
          a.position.vy += f * dy
          b.position.vx -= f * dx
          b.position.vy -= f * dy
        }
      }
    }
  }

  private applyVelocity (elapsed: number) {
    let repeat = false

    for (const object of this.objects) {

      if (this.ignoring.has(object)) continue

      object.position.x += object.position.vx
      object.position.y += object.position.vy
      object.position.vx *= this.velocityDecay ** elapsed
      object.position.vy *= this.velocityDecay ** elapsed
      const magnitude2 = object.position.vx * object.position.vx
          + object.position.vy * object.position.vy
      if (magnitude2 > this.minVelocityBeforeStop) {
        repeat = true
      }
    }
    return repeat
  }

  private freeze () {
    for (const object of this.objects) {
      object.position.vx = 0
      object.position.vy = 0
    }
  }
}

function intersects (a: DOMRect, b: DOMRect) {
  return a.left < b.right &&
      b.left < a.right &&
      a.top < b.bottom &&
      b.top < a.bottom
}