import Component from '../Component'
import Box from './Box'
import { em } from '../units'

export default class BenchmarkCanvas extends Component {
  boxes: Box[] = []

  override init () {

    for (let i = 0; i < 500; i++) {
      this.boxes.push(this.newComponent(Box))
    }
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    ctx.font = `${em(1)}px monospace`
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    for (const box of this.boxes) {
      box.x = Math.floor(Math.random() * width)
      box.y = Math.floor(Math.random() * height)
    }
  }
}