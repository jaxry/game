import ElapsedTime from '../../ElapsedTime'
import GameObject from '../../GameObject'
import Component from '../components/Component'

export default class CardPhysics {
  repelForce = 0.0005
  velocityDecay = 0.997
  minVelocityBeforeStop = 1e-5
  minIterations = 10

  private animationId = 0
  private ignoring = new WeakSet<GameObject>()

  private objects: GameObject[]
  private cards: Component[]

  constructor (
      public onUpdate: () => void) {

  }

  simulate (
      objectToCard?: Map<GameObject, Component>, repelFromCenter = false) {
    if (objectToCard) {
      this.objects = [...objectToCard.keys()]
      this.cards = [...objectToCard.values()]
    }

    const freeze = () => {
      for (const object of this.objects) {
        object.position.vx = 0
        object.position.vy = 0
      }
    }

    const elapsedTime = new ElapsedTime()

    let iterations = 0
    const tick = () => {
      const elapsed = elapsedTime.elapsed()

      repelFromCenter ?
          this.repelOverlappingFromCenters(elapsed) :
          this.repelOverlapping(elapsed)

      const repeat = this.applyVelocity(elapsed)

      this.onUpdate()

      if (repeat || ++iterations < this.minIterations) {
        this.animationId = requestAnimationFrame(tick)
      } else {
        freeze()
      }
    }

    cancelAnimationFrame(this.animationId)
    requestAnimationFrame(tick)
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
}

function intersects (a: DOMRect, b: DOMRect) {
  return a.left < b.right &&
      b.left < a.right &&
      a.top < b.bottom &&
      b.top < a.bottom
}