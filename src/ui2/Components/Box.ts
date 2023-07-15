import Component from '../Component'
import { em } from '../units'
import { randomElement } from '../../util'

const c = '0123456789abcdef'.split('')
export default class Box extends Component {
  x = 0
  y = 0
  color = `#${randomElement(c)}${randomElement(c)}${randomElement(c)}`
  // layer = makeCanvas(em(5), em(5))
  // rerender = true

  override init () {
    // this.addEventListener('pointerout', () => {
    //   this.x += em(2)
    //   this.y += em(1)
    // })

  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    // if (this.rerender) {
    //   this.rerender = false
    //   this.layer.fillStyle = this.color
    //   this.layer.fillRect(0, 0, em(5), em(5))
    //   this.layer.fillStyle = '#fff'
    //   this.layer.fillText(this.color, em(1), em(1))
    // }
    // ctx.drawImage(this.layer.canvas, this.x, this.y)
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, em(5), em(5))
    ctx.fillStyle = '#fff'
    ctx.fillText(this.color, this.x + em(1), this.y + em(1))
  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, em(5), em(5))
  }
}