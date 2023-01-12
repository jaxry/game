import { duration } from './theme'

export default class DummyElement {
  element = document.createElement('div')

  margin: string
  width: string
  height: string

  constructor (public original: Element, replace = true) {
    const { width, height, margin } = getComputedStyle(original)
    this.width = width
    this.height = height
    this.margin = margin

    this.element.style.margin = `0`
    this.element.style.width = `0`
    this.element.style.height = `0`
    this.element.style.pointerEvents = `none`

    if (replace) {
      original.replaceWith(this.element)
      this.element.append(original)
    }
  }

  grow () {
    this.element.animate({
      width: [`0`, this.width],
      height: [`0`, this.height],
      margin: [`0`, this.margin],
    }, options).onfinish = () => {
      this.element.replaceWith(this.original)
    }
  }

  growWidthFirst () {
    this.element.animate({
      width: [`0`, this.width],
    }, options).onfinish = () => {
      this.element.animate({
        height: this.height,
        margin: this.margin,
      }, options).onfinish = () => {
        this.element.replaceWith(this.original)
      }
    }
  }

  shrink () {
    this.element.animate({
      height: [this.height, `0`],
      width: [this.width, `0`],
      margin: [this.margin, `0`],
    }, { ...options, duration: duration.slow }).onfinish = () => {
      this.element.remove()
    }
  }

  shrinkHeightFirst () {
    this.element.animate({
      height: [this.height, `0`],
      width: [this.width, this.width],
      margin: [this.margin, `0`],
    }, options).onfinish = () => {
      this.element.animate({
        width: [this.width, `0`],
      }, options).onfinish = () => {
        this.element.remove()
      }
    }
  }
}

const options: KeyframeAnimationOptions = {
  duration: duration.normal,
  easing: 'ease-in-out',
  fill: 'forwards',
}