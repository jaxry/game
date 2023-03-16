import ElapsedTime from '../../ElapsedTime'
import GameObject from '../../GameObject'
import Component from '../components/Component'

export default class CardPhysics {
  repelForce = 0.002
  velocityDecay = 0.997
  minVelocityBeforeStop = 1e-5
  minIterations = 10

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

          const aBBox = cards[i].element.getBoundingClientRect()
          const bBBox = cards[j].element.getBoundingClientRect()

          if (intersects(aBBox, bBBox)) {
            const a = objects[i]
            const b = objects[j]
            const xOverlap = Math.min(
                aBBox.right, bBBox.right) - Math.max(aBBox.left, bBBox.left)
            const yOverlap = Math.min(
                aBBox.bottom, bBBox.bottom) - Math.max(aBBox.top, bBBox.top)
            const sum = xOverlap + yOverlap

            // push the objects apart on each axis proportional
            // to their overlap, so that the least overlap moves the most
            const dirX = Math.sign(a.position.x - b.position.x) * yOverlap / sum
            const dirY = Math.sign(a.position.y - b.position.y) * xOverlap / sum
            const f = this.repelForce * elapsed
            a.position.vx += f * dirX
            a.position.vy += f * dirY
            b.position.vx -= f * dirX
            b.position.vy -= f * dirY
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

    let iterations = 0
    const tick = () => {
      const elapsed = elapsedTime.elapsed()

      repelOverlapping(elapsed)
      const repeat = applyVelocity(elapsed)

      this.onUpdate()

      if (repeat || ++iterations < this.minIterations) {
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

function intersects (a: DOMRect, b: DOMRect) {
  return a.left < b.right &&
      b.left < a.right &&
      a.top < b.bottom &&
      b.top < a.bottom
}