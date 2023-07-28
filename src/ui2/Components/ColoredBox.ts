import Box from './Box.ts'
import { canvasKit } from '../canvasKit.ts'
import { Canvas } from 'canvaskit-wasm'
import { em } from '../units.ts'

export default class ColoredBox extends Box {
  override width = em(6)
  override height = em(6)

  paint = this.new(canvasKit.Paint)

  override onInit () {
    this.paint.setColorComponents(
        Math.random(), Math.random(), Math.random(), 1)
    this.paint.setAntiAlias(true)
  }

  override onDraw (canvas: Canvas) {
    canvas.drawRect4f(this.left, this.top, this.right, this.bottom, this.paint)
  }
}