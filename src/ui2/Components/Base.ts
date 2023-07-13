import Component from '../Component'
import { em } from '../units'
import Box from './Box'

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    .split('')

export default class Base extends Component {
  x = em(1)
  y = em(1)

  // str = makeArray(Math.floor(32 * (1 + randomCentered())), () => randomElement(chars)).join('')

  override init () {
    const box = this.newComponent(Box)
    box.x = em(10)
    box.y = em(5)

    this.onClick(() => {
      this.x += em(1)
      this.y += em(1)
    })
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#aea'
    ctx.fillRect(this.x, this.y, em(5), em(5))
  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, em(5), em(5))
  }
}