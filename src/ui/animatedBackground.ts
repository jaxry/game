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

  background.style.width = px(element.offsetWidth)
  background.style.height = px(element.offsetHeight)

  onResize(element, (width, height) => {
    const animation = background.animate({
      width: [px(background.offsetWidth), px(width)],
      height: [px(background.offsetHeight), px(height)],
    }, {
      duration: animDuration,
      easing: `ease`,
      fill: `forwards`,
    })

    animation.commitStyles()

    currentAnimation.get(element)?.cancel()
    currentAnimation.set(element, animation)
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