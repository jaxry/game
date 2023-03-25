import { duration } from './theme'
import animateManual from './animateManual'
import { makeStyle } from './makeStyle'

export default class DummyElement {
  element = document.createElement('div')

  style = getComputedStyle(this.element)

  constructor (public original: HTMLElement) {
    this.element.classList.add(dummyStyle)

    original.replaceWith(this.element)
    this.element.append(original)
  }

  growSmart () {
    const animation = this.element.animate({
      margin: [`0`, this.style.margin],
    }, options)

    animateManual(this.element, (t) => {
      this.element.style.width = `${t * this.original.offsetWidth}px`
      this.element.style.height = `${t * this.original.offsetHeight}px`
    }, options)

    animation.onfinish = () => {
      this.element.replaceWith(this.original)
    }

    return this
  }

  growWidthFirst () {
    this.element.style.height = `0`
    this.element.style.marginBlock = `0`

    this.element.animate({
      width: [`0`, this.style.width],
      marginInline: [`0`, this.style.marginInline],
    }, options).onfinish = () => {
      this.element.style.height = ``
      this.element.style.marginBlock = ``
      this.element.animate({
        height: [`0`, this.style.height],
        marginBlock: [`0`, this.style.marginBlock],
      }, options).onfinish = () => {
        this.element.replaceWith(this.original)
      }
    }
    return this
  }

  growWidthOnly () {
    this.element.animate({
      width: [`0`, this.style.width],
      marginInline: [`0`, this.style.marginInline],
    }, options).onfinish = () => {
      this.element.replaceWith(this.original)
    }
    return this
  }

  growHeightOnly () {
    this.element.animate({
      height: [`0`, this.style.height],
      marginBlock: [`0`, this.style.marginBlock],
    }, options).onfinish = () => {
      this.element.replaceWith(this.original)
    }
    return this
  }

  shrink () {
    this.element.animate({
      height: [this.style.height, `0`],
      width: [this.style.width, `0`],
      margin: [this.style.margin, `0`],
    }, { ...options, duration: duration.slow }).onfinish = () => {
      this.element.remove()
    }
    return this
  }

  shrinkHeightFirst () {
    this.element.animate({
      height: [this.style.height, `0`],
      marginBlock: [this.style.marginBlock, `0`],
    }, options).onfinish = () => {
      this.element.animate({
        width: [this.style.width, `0`],
        marginInline: [this.style.marginInline, `0`],
      }, options).onfinish = () => {
        this.element.remove()
      }
    }
    return this
  }

  shrinkHeightOnly () {
    this.element.animate({
      height: [this.style.height, `0`],
      marginBlock: [this.style.marginBlock, `0`],
    }, options).onfinish = () => {
      this.element.remove()
    }
    return this
  }
}

const options: KeyframeAnimationOptions = {
  duration: duration.normal,
  easing: 'ease-in-out',
  fill: 'forwards',
}

const dummyStyle = makeStyle({
  pointerEvents: `none`,
  contain: `content`,
})