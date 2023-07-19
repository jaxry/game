import Component from '../Component'
import { em } from '../units'
import { randomElement } from '../../util'
import makeCanvas from '../makeCanvas'
import { duration } from '../../ui/theme'
import { Animate, Tween } from '../Animate'

const c = '0123456789abcdef'.split('')
export default class Box extends Component {
  x = 0
  y = 0
  width = em(5)
  height = em(5)
  color = `#${randomElement(c)}${randomElement(c)}${randomElement(c)}`

  layer = makeCanvas(this.width, this.height, true)

  hover = false
  scale = 1

  get cx () {
    return this.x + this.width * 0.5
  }

  get cy () {
    return this.y + this.height * 0.5
  }

  override init () {
    this.addEventListener('pointerenter', (e) => {
      this.hover = true
      document.body.style.cursor = 'pointer'
    })
    this.addEventListener('pointerout', () => {
      this.hover = false
      document.body.style.cursor = ''
    })

    this.addEventListener('click', () => {
      console.log('clicked', this.hitId)
    })

    this.drawLayer(this.layer)

    new Grow(this).onEnd = () => {
      new Wobble(this)
    }
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
    ctx.fillText(this.color, this.cx, this.cy)
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    if (this.scale !== 1) {
      ctx.setTransform(this.scale, 0, 0, this.scale,
          this.cx * (1 - this.scale), this.cy * (1 - this.scale))
    }

    if (this.hover) {
      ctx.filter = `drop-shadow(0 0 ${em(1)}px ${this.color})`
    }

    // this.drawLayer(ctx)
    ctx.drawImage(this.layer.canvas, this.x, this.y)

    if (this.hover) {
      ctx.filter = `none`
    }
    if (this.scale !== 1) {
      ctx.resetTransform()
    }
  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  shrink () {
    new Shrink(this)
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
    this.offset = Math.sin(this.elapsed * 0.005) * 0.05
    this.component.scale = 1 + this.offset
  }
}

class Grow extends Tween {
  override duration = duration.long

  constructor (public component: Component & { scale: number }) {
    super()
  }

  override onProgress () {
    this.component.scale = this.interpolate(0, 1)
  }
}

class Shrink extends Tween {
  override duration = duration.long

  constructor (public component: Component & { scale: number }) {
    super()
  }

  override onProgress () {
    this.component.scale = this.interpolate(1, 0)
  }

  override onEnd () {
    this.component.remove()
  }
}