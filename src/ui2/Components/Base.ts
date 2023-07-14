import Component from '../Component'
import Thing from './Thing'
import { em } from '../units'

export default class Base extends Component {
  override init () {
    this.newComponent(Thing)
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#faa'
    ctx.fillRect(em(0), em(5), em(7), em(7))
  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(em(0), em(5), em(7), em(7))
  }
}