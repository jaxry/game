import Component from '../components/Component'
import { makeStyle } from '../makeStyle'
import { randomElement } from '../../util'
import { createDiv, createElement } from '../createElement'
import animatedContents from '../animatedContents'
import animatedBackground, {
  animatedBackgroundTemplate, fadeOutElement,
} from '../animatedBackground'
import { duration } from '../theme'

const chars = '0123456789abcdef'.split('')
const randomColor = () => {
  return `#${randomElement(chars)}${randomElement(chars)}${randomElement(
      chars)}`
}

export default class Base extends Component {
  override onInit () {
    this.element.classList.add(containerStyle)

    const holder = createDiv(this.element, holderStyle)

    animatedContents(holder)

    const boxes: Box[] = []
    for (let i = 0; i < 20; i++) {
      boxes.push(this.newComponent(Box).appendTo(holder))
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
  userSelect: `none`,
  display: `flex`,
  alignItems: `center`,
  justifyContent: `center`,
})

const holderStyle = makeStyle({
  width: `25rem`,
  display: `flex`,
  flexDirection: `row`,
  flexWrap: `wrap`,
  alignItems: `center`,
  gap: `1rem`,
})

export class Box extends Component {
  override onInit () {

    const color = randomColor()

    this.element.classList.add(boxStyle)

    createElement(this.element, 'span', undefined, color)

    let extender: Extender | null = null
    this.element.addEventListener('click', () => {
      if (extender) {
        let oldExtender = extender
        extender = null
        fadeOutElement(oldExtender.element, () => {
          oldExtender.remove()
        })
      } else {
        extender = this.newComponent(Extender).appendTo(this.element)
      }
    })

    // this.element.style.background = color

    const background = animatedBackground(this.element, backgroundStyle)
    background.style.background = color
  }
}

const boxStyle = makeStyle({
  position: `relative`,
  padding: `1rem`,
  display: `flex`,
  flexDirection: `column`,
})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  borderRadius: `0.5rem`,
})

class Extender extends Component {
  override onInit () {

    this.element.classList.add(extenderStyle)

    this.element.textContent = 'Lots and lots of stuff'

    this.element.animate({
      scale: [`0`, `1`],
      opacity: [`0`, `1`],
    }, {
      duration: duration.normal,
      easing: `ease`,
    })
  }
}

const extenderStyle = makeStyle({
  padding: `1rem`,
  background: `#eee`,
  color: `#000`,
  width: `max-content`,
  transformOrigin: `top left`,
})


