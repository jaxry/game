import Component from './Component'
import { em } from '../units'
import ColorBox from './ColorBox'
import { randomCentered } from '../../util'
import Layout from './Layout'

export default class Base extends Component {
  override onInit () {
    // for (let i = 0; i < 100; i++) {
    //   this.makeBox()
    // }

    // this.makeBox()

    // setInterval(() => {
    //   this.makeBox()
    // }, 50)

    const layout = this.newComponent(Layout)
    layout.x = em(3)
    layout.y = em(3)
    layout.addToLayout(ColorBox)
    layout.addToLayout(ColorBox)
    layout.addToLayout(ColorBox)

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