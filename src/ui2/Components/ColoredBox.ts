import Box from './Box.ts'
import { canvasKit, typeface } from '../canvasKit.ts'
import { Canvas, Image } from 'canvaskit-wasm'
import { em } from '../units.ts'

export default class ColoredBox extends Box {
  override width = em(6)
  override height = em(6)

  paint = this.new(canvasKit.Paint)
  font = this.new(canvasKit.Font, typeface, em(1))!
  textPaint = this.new(canvasKit.Paint)

  text = this.make(canvasKit.TextBlob.MakeFromText, 'hey there', this.font)
  image: Image

  override onInit () {
    this.paint.setColorComponents(
        Math.random(), Math.random(), Math.random(), 1)
    this.paint.setAntiAlias(true)

    this.textPaint.setColorComponents(1, 1, 1, 1)

    const layer = this.make(this.stage.surface.makeSurface.bind(this.stage.surface), {
      width: 200,
      height: 20,
      alphaType: canvasKit.AlphaType.Premul,
      colorSpace: canvasKit.ColorSpace.SRGB,
      colorType: canvasKit.ColorType.RGBA_8888,
    })

    layer.getCanvas().drawText('hey there', 0, em(1), this.textPaint, this.font)
    this.image = this.make(layer.makeImageSnapshot.bind(layer))
  }

  override onDraw (canvas: Canvas) {
    canvas.drawRect4f(this.left, this.top, this.right, this.bottom, this.paint)
    // canvas.drawTextBlob(this.text, this.left, this.top, this.textPaint)
    canvas.drawText('hey there', this.left, this.top, this.textPaint, this.font)
    // canvas.drawImage(this.image, this.left, this.top)
  }
}