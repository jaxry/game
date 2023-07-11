import Component from './Component'
import { createDiv } from '../createElement'
import { makeStyle } from '../makeStyle'
import {
  iterChildren, makeArray, numToPx, randomCentered, randomElement, translate,
} from '../../util'
import { duration } from '../theme'
import { grow, growDynamic, shrink } from '../growShrink'

const time = 1000

export default class Tester extends Component {
  constructor () {
    super()

    this.element.classList.add(testerStyle)

    for (let i = 0; i < 1; i++) {
      this.createGuy()
    }

    // setTimeout(() => {
    //   const elem = this.element.children[3] as HTMLElement
    //   elem.animate({
    //     opacity: `0`
    //   }, {
    //     duration: duration.normal,
    //   }).onfinish = () => {
    //     animateChanges(this.element, () => {
    //       elem.remove()
    //     })
    //   }
    // }, 1000)

    // setTimeout(() => {
    //   growDynamic(this.createGuy().element)
    // }, 1000)

    let interval = setInterval(() => {
      // animateChanges(this.element, () => {
      //   const guy = this.createGuy()
      //   guy.element.animate({
      //     opacity: [`0`, `1`]
      //   }, {
      //     duration: duration.normal,
      //     easing: `ease`,
      //     delay: duration.normal,
      //     fill: `backwards`,
      //   })
      // })
      growDynamic(this.createGuy().element)
    }, time * (1 + randomCentered()))

    this.onRemove(() => {
      clearInterval(interval)
    })
  }

  createGuy () {
    const guy = this.newComponent(Guy)
    const index = 1 + Math.floor(Math.random() * this.element.children.length)
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

    setTimeout(() => {
      // this.element.animate({
      //   opacity: `0`
      // }, {
      //   duration: duration.normal,
      // }).onfinish = () => {
      //   animateChanges(this.element.parentElement!, () => {
      //     this.remove()
      //   })
      // }
      shrink(this.element).onfinish = () => {
        this.remove()
      }
    }, 10 * time * (1 + randomCentered()))
  }
}

function animateChanges (element: Element, stateChange: () => void) {
  const bboxes = new Map<Element, DOMRect>()
  for (const child of iterChildren(element)) {
    bboxes.set(child, child.getBoundingClientRect())
  }
  bboxes.set(element, element.getBoundingClientRect())

  stateChange()

  for (const [child, oldBBox] of bboxes) {
    const newBBox = child.getBoundingClientRect()
    const dx = oldBBox.x - newBBox.x
    const dy = oldBBox.y - newBBox.y

    if (dx === 0 && dy === 0) continue

    child.animate({
      transform: [translate(dx, dy), 'translate(0, 0)'],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `add`
    })
  }
}

function relativeRect (element: HTMLElement) {
  const parent = element.offsetParent!
  const rect = element.getBoundingClientRect()
  const parentRect = parent.getBoundingClientRect()
  rect.x -= parentRect.x
  rect.y -= parentRect.y
  return rect
}

const testerStyle = makeStyle({
  position: `relative`,
  display: `inline-flex`,
  alignItems: `center`,
  flexDirection: `column`,
  background: `#333`,
  borderRadius: `0.5rem`,
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
