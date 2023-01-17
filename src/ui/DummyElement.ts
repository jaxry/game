import { duration } from './theme'
import { makeStyle } from './makeStyle'

export default class DummyElement {
  element = document.createElement('div')

  marginInline: string
  marginBlock: string
  width: string
  height: string

  constructor (public original: Element, replace = true) {
    const { width, height, marginInline, marginBlock } =
        getComputedStyle(original)

    this.width = width
    this.height = height
    this.marginInline = marginInline // left-right
    this.marginBlock = marginBlock // top-bottom

    this.element.style.pointerEvents = `none`

    if (replace) {
      original.replaceWith(this.element)
      this.element.append(original)
    }
  }

  grow () {
    const animation = this.element.animate({
      width: [`0`, this.width],
      height: [`0`, this.height],
      marginInline: [`0`, this.marginInline],
      marginBlock: [`0`, this.marginBlock],
    }, options)

    animation.onfinish = () => {
      this.element.replaceWith(this.original)
    }

    const tick = () => {
      const newHeight = getComputedStyle(this.original).height
      if (newHeight !== this.height) {
        this.height = newHeight
        const effect = animation.effect as KeyframeEffect
        const keyframes = effect.getKeyframes()
        keyframes[1].height = this.height
        effect.setKeyframes(keyframes)
      }
      if (animation.playState === 'running') {
        requestAnimationFrame(tick)
      }
    }
    tick()
  }

  growWidthFirst () {
    this.element.style.height = `0`
    this.element.style.marginBlock = `0`
    this.element.animate({
      width: [`0`, this.width],
      marginInline: [`0`, this.marginInline],
    }, options).onfinish = () => {
      this.element.animate({
        height: [`0`, this.height],
        marginBlock: [`0`, this.marginBlock],
      }, options).onfinish = () => {
        this.element.replaceWith(this.original)
      }
    }
  }

  growWidthOnly () {
    this.element.style.height = ``
    this.element.style.marginBlock = ``
    this.element.animate({
      width: [`0`, this.width],
      marginInline: [`0`, this.marginInline],
    }, options).onfinish = () => {
      this.element.replaceWith(this.original)
    }
  }

  growHeightOnly () {
    this.width = ``
    this.marginInline = ``
    this.element.animate({
      height: [`0`, this.height],
      marginBlock: [`0`, this.marginBlock],
    }, options).onfinish = () => {
      this.element.replaceWith(this.original)
    }
  }

  shrink () {
    this.element.animate({
      height: [this.height, `0`],
      width: [this.width, `0`],
      marginInline: [this.marginInline, `0`],
      marginBlock: [this.marginBlock, `0`],
    }, { ...options, duration: duration.slow }).onfinish = () => {
      this.element.remove()
    }
  }

  shrinkHeightFirst () {
    this.element.animate({
      height: [this.height, `0`],
      marginBlock: [this.marginBlock, `0`],
    }, options).onfinish = () => {
      this.element.animate({
        width: [this.width, `0`],
        marginInline: [this.marginInline, `0`],
      }, options).onfinish = () => {
        this.element.remove()
      }
    }
  }

  shrinkHeightOnly () {
    this.element.animate({
      height: [this.height, `0`],
      marginBlock: [this.marginBlock, `0`],
    }, options).onfinish = () => {
      this.element.remove()
    }
  }
}

const options: KeyframeAnimationOptions = {
  duration: duration.normal,
  easing: 'ease-in-out',
  fill: 'forwards',
}