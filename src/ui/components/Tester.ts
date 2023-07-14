import Component from './Component'
import { createDiv, createTextNode } from '../createElement'
import { makeStyle } from '../makeStyle'
import { makeArray, numToPx, randomCentered, randomElement } from '../../util'
import { duration } from '../theme'
import { onResize } from '../onResize'
import { animatable, animateChanges } from './animateChanges'

const time = 1000

export default class TesterContainer extends Component {
  constructor() {
    super()

    this.element.classList.add(testerContainerStyle)

    const c1 = createDiv(this.element, columnStyle)
    const c2 = createDiv(this.element, columnStyle)
    this.newComponent(Tester).appendTo(c1)
    this.newComponent(Tester).appendTo(c1)

    this.newComponent(Tester).appendTo(c2)
    this.newComponent(Tester).appendTo(c2)
  }
}

const testerContainerStyle = makeStyle({
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
  height: `100%`,
})

const columnStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
})

class Tester extends Component {

  background = createDiv(this.element, backgroundStyle)

  constructor () {
    super()

    this.element.classList.add(testerStyle, animatable)

    onResize(this.element, (box) => {
      this.background.animate({
        width: [
          numToPx(this.background.offsetWidth),
          numToPx(box.borderBoxSize[0].inlineSize)],
        height: [
          numToPx(this.background.offsetHeight),
          numToPx(box.borderBoxSize[0].blockSize)],
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

class Guy extends Component {

  background = createDiv(this.element, guyBackgroundStyle)

  constructor () {
    super()
    this.element.classList.add(guyStyle, animatable)

    onResize(this.element, (box) => {
      this.background.animate({
        width: [
          numToPx(this.background.offsetWidth),
          numToPx(box.borderBoxSize[0].inlineSize)],
        height: [
          numToPx(this.background.offsetHeight),
          numToPx(box.borderBoxSize[0].blockSize)],
      }, {
        fill: `forwards`,
        duration: duration.normal,
        easing: `ease`,
      })
    })

    this.element.addEventListener('pointerenter', () => {
      animateChanges(this.element.parentElement!, () => {
        this.element.style.height = `10rem`
      })
    })
    this.element.addEventListener('pointerleave', () => {
      animateChanges(this.element.parentElement!, () => {
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
