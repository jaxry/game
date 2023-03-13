import ElapsedTime from '../../ElapsedTime'
import GameObject from '../../GameObject'
import Component from '../components/Component'

export default class CardPhysics {
  repelForce = 0.005
  velocityDecay = 0.993
  minVelocityBeforeStop = 1e-6

  private animationId = 0
  private ignoring = new WeakSet<GameObject>()

  constructor (
      public objectToCard: Map<GameObject, Component>,
      public onUpdate: () => void) {

  }

  simulate () {
    const objects = [...this.objectToCard.keys()]
    const cards = [...this.objectToCard.values()]

    const repelOverlapping = (elapsed: number) => {
      for (let i = 0; i < objects.length; i++) {

        if (this.ignoring.has(objects[i])) continue

        for (let j = i + 1; j < objects.length; j++) {

          if (this.ignoring.has(objects[j])) continue

          if (intersects(cards[i].element, cards[j].element)) {
            const a = objects[i]
            const b = objects[j]
            const dx = a.position.x - b.position.x
            const dy = a.position.y - b.position.y
            const f = this.repelForce * elapsed / Math.sqrt(dx * dx + dy * dy)
            a.position.vx += f * dx
            a.position.vy += f * dy
            b.position.vx -= f * dx
            b.position.vy -= f * dy
          }
        }
      }
    }

    const applyVelocity = (elapsed: number) => {
      let repeat = false

      for (const object of objects) {

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

    const elapsedTime = new ElapsedTime()

    const tick = () => {
      const elapsed = elapsedTime.elapsed()

      repelOverlapping(elapsed)
      const repeat = applyVelocity(elapsed)

      this.onUpdate()

      if (repeat) {
        this.animationId = requestAnimationFrame(tick)
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
}

function intersects (a: Element, b: Element) {
  const aBBox = a.getBoundingClientRect()
  const bBBox = b.getBoundingClientRect()
  return aBBox.left < bBBox.right &&
      bBBox.left < aBBox.right &&
      aBBox.top < bBBox.bottom &&
      bBBox.top < aBBox.bottom
}