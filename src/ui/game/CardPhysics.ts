import Position from '../../Position'
import ElapsedTime from '../../ElapsedTime'
import { clamp } from '../../util'

export default class CardPhysics {

  simulate (position: Position, callback: () => void) {
    position.vx = clamp(-1, 1, position.vx)
    position.vy = clamp(-1, 1, position.vy)
    const elapsedTime = new ElapsedTime()

    function tick () {
      const elapsed = elapsedTime.elapsed()
      position.x += position.vx * elapsed
      position.y += position.vy * elapsed
      position.vx *= 0.99 ** elapsed
      position.vy *= 0.99 ** elapsed

      callback()
      if (position.vx * position.vx + position.vy * position.vy > 0.01) {
        // setTimeout(tick, 18)
        requestAnimationFrame(tick)
      } else {
        position.vx = 0
        position.vy = 0
      }
    }

    tick()
  }
}