import Component from '../Component'
import { em } from '../units'
import { randomElement } from '../../util'
import makeCanvas from '../makeCanvas'

const c = '0123456789abcdef'.split('')
export default class Box extends Component {
  x = 0
  y = 0
  color = `#${randomElement(c)}${randomElement(c)}${randomElement(c)}`
  layer = makeCanvas(em(5), em(5))
  hover = false

  override init () {
    this.addEventListener('pointerenter', (e) => {
      this.hover = true
      document.body.style.cursor = 'pointer'
    })
    this.addEventListener('pointerout', () => {
      this.hover = false
      document.body.style.cursor = ''
    })
    // this.layer.font = `${em(1)}px monospace`
    // this.layer.fillStyle = this.color
    // this.layer.fillRect(0, 0, em(5), em(5))
    // this.layer.fillStyle = '#fff'
    // this.layer.fillText(this.color, 0, em(1))

  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    // ctx.drawImage(this.layer.canvas, this.x, this.y)
    if (this.hover) {
      ctx.filter = `drop-shadow(0 0 ${em(1)}px ${this.color})`
    }
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, em(5), em(5))
    ctx.filter = 'none'

    ctx.fillStyle = '#fff'
    ctx.fillText(this.color, this.x, this.y + em(1))

  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, em(5), em(5))
  }
}