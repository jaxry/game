import Component from '../components/Component'
import { makeStyle } from '../makeStyle'
import { randomElement, translate } from '../../util'
import makeDraggable from '../makeDraggable'
import animatedBackground, { animatedBackgroundTemplate } from '../animatedBackground'
import { createDiv, createTextNode } from '../createElement'

const chars = '0123456789abcdef'.split('')
const randomColor = () => {
  return `#${randomElement(chars)}${randomElement(chars)}${randomElement(chars)}`
}

export default class Base extends Component {
  override onInit () {
    this.element.classList.add(containerStyle)

    const w = this.element.clientWidth
    const h = this.element.clientHeight


    const boxes: Box[] = []
    for (let i = 0; i < 100; i++) {
      boxes.push(this.newComponent(Box).appendTo(this.element))
    }

    for (const box of boxes) {
      box.setPosition(Math.random() * w, Math.random() * h)
    }

  }
}

const containerStyle = makeStyle({
  position: `relative`,
  height: '100%',
  userSelect: `none`
})

export class Box extends Component {
  x = 0
  y = 0

  override onInit () {
    this.element.classList.add(boxStyle)

    const color = randomColor()

    const background = animatedBackground(this.element, backgroundStyle)
    background.style.background = color

    createTextNode(this.element, color)

    makeDraggable(this.element, {
      onDrag: (e) => {
        this.x += e.movementX
        this.y += e.movementY
        this.updatePosition()
      }
    })

    let extender: Extender
    this.element.addEventListener('pointerenter', () => {
      extender = this.newComponent(Extender).appendTo(this.element)
    })

    this.element.addEventListener('pointerleave', () => {
      extender.remove()
    })
  }

  updatePosition () {
    this.element.style.transform = translate(this.x, this.y)
  }

  setPosition (x: number, y: number) {
    this.x = x
    this.y = y
    this.updatePosition()
  }
}

const boxStyle = makeStyle({
  position: `absolute`,
  minWidth: '6rem',
  minHeight: '6rem',
})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
})

class Extender extends Component {
  override onInit () {
    this.element.classList.add(extenderStyle)

    this.element.textContent = 'Lots and lots of stuff'

    this.element.animate({
      opacity: [`0`, `1`]
    }, {
      duration: 1000,
      easing: `ease`
    })
  }
}

const extenderStyle = makeStyle({
  padding: `1rem`,
  height: `5rem`,
  background: `#eee`,
  color: `#000`
})


