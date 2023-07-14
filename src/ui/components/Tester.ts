import Component from './Component'
import { createDiv, createTextNode } from '../createElement'
import { makeStyle } from '../makeStyle'
import { makeArray, numToPx, randomCentered, randomElement } from '../../util'
import { duration } from '../theme'
import { onResize } from '../onResize'
import { animatable, animateChanges } from './animateChanges'

const time = 1000

export default class Tester extends Component {

  background = createDiv(this.element, backgroundStyle)

  constructor () {
    super()

    this.element.classList.add(testerStyle, animatable)

    onResize(this.element, () => {
      this.background.animate({
        width: [
          numToPx(this.background.offsetWidth),
          numToPx(this.element.offsetWidth)],
        height: [
          numToPx(this.background.offsetHeight),
          numToPx(this.element.offsetHeight)],
      }, {
        fill: `forwards`,
        duration: duration.normal,
        easing: `ease`,
      })
    })

    for (let i = 0; i < 3; i++) {
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
    //   const guy = this.createGuy()
    //   // animateChanges(this.items, () => {
    //   //   const guy = this.createGuy()
    //   //   guy.element.animate({
    //   //     opacity: [`0`, `1`]
    //   //   }, {
    //   //     duration: duration.normal,
    //   //     easing: `ease`,
    //   //     delay: duration.normal,
    //   //     fill: `backwards`,
    //   //   })
    //   // })
    // }, 1000)
    //
    // let interval = setInterval(() => {
    //   animateChanges(() => {
    //     const guy = this.createGuy()
    //     guy.element.animate({
    //       opacity: [`0`, `1`]
    //     }, {
    //       duration: duration.normal,
    //       easing: `ease`,
    //     })
    //   })
    // }, time * (1 + randomCentered()))

    // this.onRemove(() => {
    //   clearInterval(interval)
    // })
  }

  createGuy () {
    const guy = this.newComponent(Guy)
    const index = 1 + Math.floor(Math.random() * this.element.children.length)
    this.element.insertBefore(guy.element, this.element.children[index])
    return guy
  }
}

class Guy extends Component {

  background = createDiv(this.element, guyBackgroundStyle)

  constructor () {
    super()
    this.element.classList.add(guyStyle, animatable)

    onResize(this.element, () => {
      this.background.animate({
        width: [
          numToPx(this.background.offsetWidth),
          numToPx(this.element.offsetWidth)],
        height: [
          numToPx(this.background.offsetHeight),
          numToPx(this.element.offsetHeight)],
      }, {
        fill: `forwards`,
        duration: duration.normal,
        easing: `ease`,
      })
    })

    this.element.addEventListener('pointerenter', () => {
      animateChanges(() => {
        this.element.style.height = `10rem`
      })
    })
    this.element.addEventListener('pointerleave', () => {
      animateChanges(() => {
        this.element.style.height = ``
      })
    })

    const char = `abcdefghijklmnopqrstuvwxyz`.split('')
    const len = Math.floor(15 * (1 + randomCentered()))
    const str = makeArray(len, () => randomElement(char)).join('')

    createTextNode(this.element, str)

    // setTimeout(() => {
    //   this.element.animate({
    //     opacity: `0`
    //   }, {
    //     duration: duration.normal,
    //   }).onfinish = () => {
    //     animateChanges(() => {
    //       this.remove()
    //     })
    //   }
    // }, 10 * time * (1 + randomCentered()))
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
  flexDirection: `column`,
  // alignItems: `center`,
})

const backgroundStyle = makeStyle({
  position: `absolute`,
  inset: `0`,
  background: `#333`,
  borderRadius: `0.5rem`,
  zIndex: `-1`,
})

const guyStyle = makeStyle({
  position: `relative`,
  padding: `1rem`,
  margin: `0.5rem`,
})

const guyBackgroundStyle = makeStyle({
  position: `absolute`,
  inset: `0`,
  background: `purple`,
  borderRadius: `0.5rem`,
  zIndex: `-1`,
})
