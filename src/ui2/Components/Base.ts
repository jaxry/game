import Component from '../Component'
import Thing from './Thing'
import { em } from '../units'
import Box from './Box'

export default class Base extends Component {
  override init () {
    this.newComponent(Thing)
    const box = this.newComponent(Box)
    box.y = em(7)
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    ctx.font = `${em(1)}px monospace`
  }
}

