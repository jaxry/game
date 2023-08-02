import Component from '../components/Component'
import { makeStyle } from '../makeStyle'
import { numToPx, randomElement } from '../../util'
import makeDraggable from '../makeDraggable'
import { createElement } from '../createElement'
import animateContents from '../animateContents'
import AnimatedSize from './AnimatedSize'

const chars = '0123456789abcdef'.split('')
const randomColor = () => {
  return `#${randomElement(chars)}${randomElement(chars)}${randomElement(
      chars)}`
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

    // const tick = () => {
    //   for (const box of boxes) {
    //     box.setPosition(Math.random() * w, Math.random() * h)
    //   }
    //   requestAnimationFrame(tick)
    // }
    // tick()
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  height: '100%',
  userSelect: `none`
})

export class Box extends AnimatedSize {
  x = 0
  y = 0

  override onInit () {
    const color = randomColor()
    this.element.style.background = color

    this.content.classList.add(contentStyle)

    makeDraggable(this.element, {
      onDrag: (e) => {
        this.x += e.movementX
        this.y += e.movementY
        this.updatePosition()
      },
    })

    createElement(this.content, 'span', undefined, color)

    let extender: Extender | null = null
    this.element.addEventListener('pointerenter', () => {
      animateContents(this.content, () => {
        if (extender) {
          this.cancelAnimatedRemove(extender.element)
        } else {
          extender = this.newComponent(Extender).appendTo(this.content)
        }
      })
    })

    this.element.addEventListener('pointerleave', () => {
      animateContents(this.content, () => {
        this.animatedRemove(extender!.element, () => {
          extender!.remove()
          extender = null
        })
      })
    })
  }

  updatePosition () {
    this.element.style.left = numToPx(this.x)
    this.element.style.top = numToPx(this.y)
  }

  setPosition (x: number, y: number) {
    this.x = x
    this.y = y
    this.updatePosition()
  }
}

const contentStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
  justifyContent: `center`,
})

class Extender extends Component {
  override onInit () {
    this.element.classList.add(extenderStyle)

    this.element.textContent = 'Lots and lots of stuff'
  }
}

const extenderStyle = makeStyle({
  padding: `1rem`,
  background: `#eee`,
  color: `#000`,
  width: `max-content`,
})


