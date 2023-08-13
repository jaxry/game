import Component from '../components/Component'
import { makeStyle } from '../makeStyle'
import { randomElement } from '../../util'
import { createElement } from '../createElement'
import animatedContents from '../animatedContents'
import animatedBackground, {
  animatedBackgroundTemplate,
} from '../animatedBackground'
import { duration } from '../theme'

export default class Base extends Component {
  override onInit () {
    this.element.classList.add(containerStyle)

    animatedContents(this.element)

    this.newComponent(Holder).appendTo(this.element)
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  height: '100%',
  display: `flex`,
  alignItems: `center`,
  justifyContent: `center`,
})

export class Holder extends Component {
  override onInit () {
    this.element.classList.add(holderStyle)

    for (let i = 0; i < 5; i++) {
      this.newComponent(Box).appendTo(this.element)
    }

    // setTimeout(() => {
    //   this.newComponent(Box).appendTo(this.element)
    // }, 2000)
    animatedContents(this.element)

  }
}

const holderStyle = makeStyle({
  width: `25rem`,
  display: `flex`,
  flexDirection: `row`,
  flexWrap: `wrap`,
  alignItems: `center`,
  gap: `0.5rem`,
  padding: `1rem`,
})

const chars = '0123456789abcdef'.split('')
const randomColor = () => {
  return `#${randomElement(chars)}${randomElement(chars)}${randomElement(
      chars)}`
}

export class Box extends Component {
  override onInit () {
    const color = randomColor()

    this.element.classList.add(boxStyle)

    const label = createElement(this.element, 'span', undefined, color)

    label.addEventListener('click', (e) => {
      this.remove()
    })

    let extender: Extender | null = null
    let fadeOutCancel: (() => void) | null = null

    // this.element.addEventListener('click', () => {
    //   if (fadeOutCancel) {
    //     fadeOutCancel()
    //     fadeOutCancel = null
    //   } else if (extender) {
    //     fadeOutCancel = fadeOutElement(extender.element, () => {
    //       extender?.remove()
    //       extender = null
    //       fadeOutCancel = null
    //     })
    //   } else {
    //     extender = this.newComponent(Extender).appendTo(this.element)
    //   }
    // })

    this.element.addEventListener('click', (e) => {
      if (e.target !== this.element) return
      this.newComponent(Box).appendTo(this.element)
    })

    const background = animatedBackground(this.element, backgroundStyle)
    background.style.background = color

    animatedContents(this.element)
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
})


