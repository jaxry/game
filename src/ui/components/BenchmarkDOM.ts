import Component from './Component'
import { numToPx, randomElement, translate } from '../../util'
import { makeStyle } from '../makeStyle'

export default class BenchmarkDOM extends Component {
  boxes: Box[] = []
  constructor () {
    super()

    this.element.classList.add(testerStyle)

    for (let i = 0; i < 500; i++) {
      this.boxes.push(this.newComponent(Box).appendTo(this.element))
    }


    let animationId: number
    const paint = () => {

      for (const box of this.boxes) {
        const width = this.element.clientWidth
        const height = this.element.clientHeight
        box.position(
            Math.floor(Math.random() * width),
            Math.floor(Math.random() * height))
      }
      requestAnimationFrame(paint)
    }

    this.onRemove(() => {
      cancelAnimationFrame(animationId)
    })

    requestAnimationFrame(() => {
      paint()
    })
  }
}

const testerStyle = makeStyle({
  position: `relative`,
  height: `100%`
})


const c = '0123456789abcdef'.split('')
class Box extends Component {
  constructor () {
    super()

    this.element.classList.add(boxStyle)

    const color = `#${randomElement(c)}${randomElement(c)}${randomElement(c)}`
    this.element.style.background = color

    this.element.textContent = color

  }

  position (x: number, y: number) {
    this.element.style.transform = translate(x, y)
  }
}

const boxStyle = makeStyle({
  position: `absolute`,
  width: `5rem`,
  height: `5rem`,
  color: `white`,
  font: `1rem monospace`,
})