import Component from '../Component'
import { em } from '../units'
import Box from './Box'

export default class Thing extends Component {
  x = em(1)
  y = em(1)

  // str = makeArray(Math.floor(32 * (1 + randomCentered())), () => randomElement(chars)).join('')

  override init () {

    const box2 = this.newComponent(Box)
    box2.color = `#ffa`
    box2.x = em(4)
    box2.y = em(5)

    const box = this.newComponent(Box)
    box.x = em(4)
    box.y = em(0)


    this.addEventListener('pointerdown', () => {
      // this.x += em(1)
      // this.y += em(1)
      console.log('enter')
    })

    this.addEventListener('pointerout', () => {
      // this.x += em(1)
      // this.y += em(1)
      console.log('leave')
    })
  }

  override onDraw (ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#aea'
    ctx.fillRect(this.x, this.y, em(7), em(7))
  }

  override hitbox (ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, em(7), em(7))
  }
}