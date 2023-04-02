import { duration } from './theme'
import animateManual from './animateManual'
import { makeStyle } from './makeStyle'
import { createDiv } from './create'

export default class DummyElement {
  dummy = createDiv(null, dummyStyle)

  style = getComputedStyle(this.dummy)

  constructor (public original: HTMLElement) {
    original.replaceWith(this.dummy)
    this.dummy.append(original)
  }

  growSmart () {
    const animation = this.dummy.animate({
      margin: [`0`, this.style.margin],
    }, options)

    animateManual(this.dummy, (t) => {
      this.dummy.style.width = `${t * this.original.offsetWidth}px`
      this.dummy.style.height = `${t * this.original.offsetHeight}px`
    }, options)

    animation.onfinish = () => {
      this.dummy.replaceWith(this.original)
    }

    return this
  }

  growWidthFirst () {
    this.dummy.style.height = `0`
    this.dummy.style.marginBlock = `0`

    this.dummy.animate({
      width: [`0`, this.style.width],
      marginInline: [`0`, this.style.marginInline],
    }, options).onfinish = () => {
      this.dummy.style.height = ``
      this.dummy.style.marginBlock = ``
      this.dummy.animate({
        height: [`0`, this.style.height],
        marginBlock: [`0`, this.style.marginBlock],
      }, options).onfinish = () => {
        this.dummy.replaceWith(this.original)
      }
    }
    return this
  }

  growWidthOnly () {
    this.dummy.animate({
      width: [`0`, this.style.width],
      marginInline: [`0`, this.style.marginInline],
    }, options).onfinish = () => {
      this.dummy.replaceWith(this.original)
    }
    return this
  }

  growHeightOnly () {
    this.dummy.animate({
      height: [`0`, this.style.height],
      marginBlock: [`0`, this.style.marginBlock],
    }, options).onfinish = () => {
      this.dummy.replaceWith(this.original)
    }
    return this
  }

  shrink () {
    this.dummy.animate({
      height: [this.style.height, `0`],
      width: [this.style.width, `0`],
      margin: [this.style.margin, `0`],
    }, { ...options, duration: duration.slow }).onfinish = () => {
      this.dummy.remove()
    }
    return this
  }

  shrinkHeightFirst () {
    this.dummy.animate({
      height: [this.style.height, `0`],
      marginBlock: [this.style.marginBlock, `0`],
    }, options).onfinish = () => {
      this.dummy.animate({
        width: [this.style.width, `0`],
        marginInline: [this.style.marginInline, `0`],
      }, options).onfinish = () => {
        this.dummy.remove()
      }
    }
    return this
  }

  shrinkHeightOnly () {
    this.dummy.animate({
      height: [this.style.height, `0`],
      marginBlock: [this.style.marginBlock, `0`],
    }, options).onfinish = () => {
      this.dummy.remove()
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