import { onResize } from './onResize'
import { px } from '../util'
import { duration, fadeOut } from './theme'
import { createDiv } from './createElement'

export const animatedBackgroundTemplate = {
  position: `absolute`,
  top: `0`,
  left: `0`,
  zIndex: `-1`,
}

const currentAnimation = new WeakMap<any, Animation>()

export default function animatedBackground (
    element: HTMLElement, backgroundStyle: string,
    animDuration = duration.normal) {

  const background = createDiv(null, backgroundStyle)
  element.prepend(background)

  // microtask runs after the element has been fully
  // initialized with all its children
  queueMicrotask(() => {
    background.style.width = px(element.offsetWidth)
    background.style.height = px(element.offsetHeight)

    onResize(element, (width, height) => {
      const oldWidth = background.offsetWidth
      const oldHeight = background.offsetHeight

      const expanding = width > oldWidth || height > oldHeight

      const animation = background.animate({
        width: [px(oldWidth), px(width)],
        height: [px(oldHeight), px(height)],
      }, {
        duration: animDuration,
        easing: `ease`,
        fill: `both`,
        delay: expanding ? 0 : animDuration / 4,
      })

      animation.commitStyles()

      currentAnimation.get(element)?.cancel()
      currentAnimation.set(element, animation)
    })
  })

  return background
}

export function fadeOutAbsolute (element: HTMLElement, onFinish: () => void) {
  element.style.left = px(element.offsetLeft)
  element.style.top = px(element.offsetTop)
  element.style.position = `absolute`

  const animation = fadeOut(element, onFinish)

  return () => {
    element.style.position = ``
    element.style.left = ``
    element.style.top = ``
    animation.cancel()
  }
}