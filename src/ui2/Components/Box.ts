import Component from '../Component'
import { em } from '../units'

export default class Box extends Component {
  x = 0
  y = 0
  color = '#aaf'

  override init () {
    // this.addEventListener('pointerout', () => {
    //   this.x += em(2)
    //   this.y += em(1)
    // })
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, em(5), em(5))
  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, em(5), em(5))
  }
}