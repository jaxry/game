import Component from './Component'
import { em } from '../units'
import { randomElement } from '../../util'
import makeCanvas from '../makeCanvas'
import { duration } from '../../ui/theme'
import { Animate, Tween } from '../Animate'
import makeDraggable from '../makeDraggable'
import Box from './Box'

const c = '0123456789abcdef'.split('')

export default class ColorBox extends Box {
  color = `#${randomElement(c)}${randomElement(c)}${randomElement(c)}`

  layer: CanvasRenderingContext2D

  hover = false
  scale = 1

  override init () {
    this.width = em(5)
    this.height = em(5)
    this.layer = makeCanvas(this.width, this.height, true)
    this.drawLayer(this.layer)

    this.addEventListener('pointerenter', (e) => {
      this.hover = true
      document.body.style.cursor = 'grab'
    })
    this.addEventListener('pointerout', () => {
      this.hover = false
      document.body.style.cursor = ''
    })

    this.addEventListener('click', () => {
      console.log('clicked', this.hitId)
    })

    new Grow(this)
    new Wobble(this)

    makeDraggable(this, {
      onDrag: (e) => {
        this.x += e.movementX * devicePixelRatio
        this.y += e.movementY * devicePixelRatio
      },
    })
  }

  drawLayer (ctx: CanvasRenderingContext2D) {
    ctx.font = `${em(1)}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.roundRect(this.x, this.y, this.width, this.height, em(0.5))
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.fillText(this.color, this.centerX, this.centerY)
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    if (this.scale !== 1) {
      ctx.setTransform(this.scale, 0, 0, this.scale,
          this.centerX * (1 - this.scale), this.centerY * (1 - this.scale))
    }

    if (this.hover) {
      ctx.filter = `drop-shadow(0 0 ${em(1)}px ${this.color})`
    }

    ctx.drawImage(this.layer.canvas, this.x, this.y)

    if (this.hover) {
      ctx.filter = `none`
    }
    if (this.scale !== 1) {
      ctx.resetTransform()
    }
  }

  shrink () {
    new Shrink(this)
  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

class Wobble extends Animate {
  offset = 0

  constructor (public component: Component & { scale: number }) {
    super()
    component.onRemove(() => {
      this.end()
    })
  }

  override tick (time: number) {
    this.component.scale -= this.offset
    this.offset = this.component.scale * Math.sin(this.elapsed * 0.005) * 0.05
    this.component.scale += this.offset
  }
}

class Grow extends Tween {
  override duration = duration.long

  constructor (public component: Component & { scale: number }) {
    super()
    this.component.scale = 0
  }

  override onProgress () {
    this.component.scale += this.interpolateDiff(1)
  }
}

class Shrink extends Tween {
  override duration = duration.long

  constructor (public component: Component & { scale: number }) {
    super()
  }

  override onProgress () {
    this.component.scale += this.interpolateDiff(-1)
  }

  override onEnd () {
    this.component.remove()
  }
}