import Component from '../components/Component'
import { makeStyle } from '../makeStyle'
import { numToPx, randomElement } from '../../util'
import makeDraggable from '../makeDraggable'
import { animatedBackgroundTemplate } from '../animatedBackground'
import { createDiv, createElement } from '../createElement'
import { onResize } from '../onResize'
import { duration } from '../theme'

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

export class Box extends Component {
  x = 0
  y = 0
  list = createDiv(this.element, listStyle)

  override onInit () {
    this.element.classList.add(boxStyle)
    const color = randomColor()
    this.element.style.background = color

    onResize(this.list, (box) => {
      // this.element.style.width = numToPx(this.list.scrollWidth)
      // this.element.style.height = numToPx(this.list.scrollHeight)
      this.element.animate({
        width: [
          numToPx(this.element.offsetWidth), numToPx(this.list.scrollWidth)],
        height: [
          numToPx(this.element.offsetHeight), numToPx(this.list.scrollHeight)],
      }, {
        duration: duration.long,
        easing: `ease`,
        fill: `forwards`,
      })
    })

    makeDraggable(this.element, {
      onDrag: (e) => {
        this.x += e.movementX
        this.y += e.movementY
        this.updatePosition()
      },
    })

    createElement(this.list, 'span', undefined, color)

    let extender: Extender
    this.element.addEventListener('pointerenter', () => {
      // extender = this.addComponent(Extender)
      extender = this.newComponent(Extender).appendTo(this.list)
    })

    this.element.addEventListener('pointerleave', () => {
      extender.remove()
    })

    // this.arrangeElements()
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

const boxStyle = makeStyle({
  position: `absolute`,
  overflow: `hidden`,
})

const listStyle = makeStyle({
  position: `absolute`,
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
  justifyContent: `center`,
})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
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


