import Component from './Component'
import ColorBox from './ColorBox'
import { randomCentered } from '../../util'
import { Canvas } from 'canvaskit-wasm'
import { canvasKit } from '../canvasKit.ts'

export default class Base extends Component {
  x = 0
  y = 0
  paint = new canvasKit.Paint()
  rect = canvasKit.XYWHRect(0, 0, 100, 100)

  override onInit () {
    // for (let i = 0; i < 100; i++) {
    //   this.makeBox()
    // }

    // this.makeBox()

    // setInterval(() => {
    //   this.makeBox()
    // }, 50)

    // const layout = this.newComponent(Layout)
    // layout.x = em(3)
    // layout.y = em(3)
    // layout.addToLayout(ColorBox)
    // layout.addToLayout(ColorBox)
    // layout.addToLayout(ColorBox)
    this.paint.setColorComponents(Math.random(), Math.random(), Math.random(),
        1)
    this.paint.setAntiAlias(true)
  }

  makeBox () {
    const box = this.newComponent(ColorBox)
    box.x =
        Math.floor((this.stage.canvasElement.width - box.width) * Math.random())
    box.y = Math.floor(
        (this.stage.canvasElement.height - box.height) * Math.random())
    setTimeout(() => {
      box.shrink()
    }, 10000 * (1 + randomCentered()))
  }

  override onDraw (canvas: Canvas) {
    canvas.drawRect(this.rect, this.paint)
    this.rect[0] += 0.1
    this.rect[1] += 0.1
    this.rect[2] += 0.1
    this.rect[3] += 0.1

  }
}