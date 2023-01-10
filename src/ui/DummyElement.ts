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

    this.element.style.margin = '0'
    this.element.style.pointerEvents = 'none'

    if (replace) {
      original.replaceWith(this.element)
      this.element.append(original)
    }
  }

  full () {
    this.element.style.width = this.width
    this.element.style.height = this.height
    this.element.style.margin = this.margin
    return this
  }

  grow (options: KeyframeAnimationOptions = {}) {
    const animation = this.element.animate({
      height: [`0`, this.height],
      width: [`0`, this.width],
      margin: [`0`, this.margin],
    }, { ...defaultOptions, ...options })

    animation.onfinish = () => {
      this.element.replaceWith(this.original)
    }

    return animation
  }

  shrink (options: KeyframeAnimationOptions = {}) {
    const animation = this.element.animate({
      height: [this.height, `0`],
      width: [this.width, `0`],
      margin: [this.margin, `0`],
    }, { ...defaultOptions, ...options })

    animation.onfinish = () => {
      this.element.remove()
    }
  }
}

const defaultOptions: KeyframeAnimationOptions = {
  duration: duration.normal,
  easing: 'ease-in-out',
  fill: 'forwards',
}