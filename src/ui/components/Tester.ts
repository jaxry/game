import Component from './Component'
import { grow, shrink } from '../growShrink'
import { createDiv } from '../createElement'
import { addStyle, makeStyle } from '../makeStyle'
import {
  iterChildren, makeArray, mapFilter, randomCentered, randomElement, translate,
  translateDiff,
} from '../../util'
import { duration } from '../theme'

const time = 1000

export default class Tester extends Component {
  constructor () {
    super()

    this.element.classList.add(testerStyle)

    // for (let i = 0; i < 10; i++) {
    //   this.createGuy()
    // }

    // setTimeout(() => {
    //   animateChanges(this.element, () => {
    //     const elem = this.element.children[3]
    //     elem.remove()
    //   })
    //
    // }, 1000)

    let interval = setInterval(() => {
      animateChanges(this.element, () => {
        const guy = this.createGuy()
        guy.element.animate({
          opacity: [`0`, `1`]
        }, {
          duration: duration.long,
          easing: `ease`
        })
      })
      // grow(this.createGuy().element)
    }, time * (1 + randomCentered()))

    this.onRemove(() => {
      clearInterval(interval)
    })
  }

  createGuy () {
    const guy = this.newComponent(Guy)
    const index = Math.floor(Math.random() * this.element.children.length)
    this.element.insertBefore(guy.element, this.element.children[index])
    return guy
  }
}

class Guy extends Component {
  constructor () {
    super()
    this.element.classList.add(guyStyle)

    const char = `abcdefghijklmnopqrstuvwxyz`.split('')
    const len = Math.floor(20 * (1 + randomCentered()))
    const str = makeArray(len, () => randomElement(char)).join('')

    createDiv(this.element, innerGuyStyle, str)

    // setTimeout(() => {
    //   // shrink(this.element).onfinish = () => {
    //   //   this.remove()
    //   // }
    //   this.remove()
    // }, 10 * time * (1 + randomCentered()))
  }
}

function animateChanges (element: Element, stateChange: () => void) {
  const bboxes = new Map<Element, DOMRect>()
  for (const child of iterChildren(element)) {
    bboxes.set(child, child.getBoundingClientRect())
  }

  stateChange()

  for (const [child, oldBBox] of bboxes) {
    const newBBox = child.getBoundingClientRect()
    const dx = oldBBox.x - newBBox.x
    const dy = oldBBox.y - newBBox.y
    child.animate({
      transform: [translate(dx, dy), 'translate(0, 0)']
    }, {
      duration: duration.long,
      easing: `ease`,
      composite: `add`
    })
  }
}

const testerStyle = makeStyle({
  overflow: `auto`,
  position: `relative`,
  display: `inline-flex`,
  alignItems: `center`,
  flexDirection: `column`,
  background: `#333`,
})

const guyStyle = makeStyle({
  flex: `0 0 auto`,
  padding: `0.5rem`,
})

const innerGuyStyle = makeStyle({
  background: `purple`,
  padding: `1rem`,
  borderRadius: `0.5rem`,
})
