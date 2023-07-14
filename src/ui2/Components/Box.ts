import Component from '../Component'
import { em } from '../units'

export default class Box extends Component {
  x = 0
  y = 0

  override init () {
    this.onClick(() => {
      this.x += em(2)
      this.y += em(1)
    })

    this.onPointerDown(() => {
      console.log('down')
    })

    this.onPointerUp(() => {
      console.log('up')
    })

    this.onPointerEnter(() => {
      console.log('enter')
    })

    this.onPointerOut(() => {
      console.log('out')
    })
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#aaf'
    ctx.fillRect(this.x, this.y, em(5), em(5))
  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, em(5), em(5))
  }
}