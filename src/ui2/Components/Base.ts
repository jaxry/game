import Component from './Component'
import { em } from '../units'
import ColorBox from './ColorBox'
import { randomCentered } from '../../util'

export default class Base extends Component {
  override init () {
    // for (let i = 0; i < 100; i++) {
    //   this.makeBox()
    // }

    // this.makeBox()

    setInterval(() => {
      this.makeBox()
    }, 50)
  }

  makeBox () {
    const box = this.newComponent(ColorBox)
    box.x = Math.floor((this.stage.canvas.width - box.width) * Math.random())
    box.y = Math.floor((this.stage.canvas.height - box.height) * Math.random())
    setTimeout(() => {
      box.shrink()
    }, 10000 * (1 + randomCentered()))
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    ctx.font = `${em(1)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
  }
}