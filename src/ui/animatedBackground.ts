import { onResize } from './onResize'
import { px } from '../util'
import { duration } from './theme'
import { createDiv } from './createElement'

export const animatedBackgroundTemplate = {
  position: `absolute`,
  inset: `0`,
  zIndex: `-1`,
}

const currentAnimation = new WeakMap<any, Animation>()

export default function animatedBackground (
    element: HTMLElement, backgroundStyle: string) {
  const background = createDiv(null, backgroundStyle)
  element.prepend(background)

  const setDimensions = (width: number, height: number) => {
    background.style.width = px(width)
    background.style.height = px(height)
  }

  setDimensions(element.offsetWidth, element.offsetHeight)

  const borderRadius = getComputedStyle(background).borderRadius

  onResize(element, (width, height, dw, dh) => {
    if (!element.style.clipPath) {
      element.style.clipPath = `inset(0 round ${borderRadius})`
    }

    const animation = element.animate({
      clipPath: [`inset(0 ${dw}px ${dh}px 0)`, `inset(0)`],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `accumulate`,
    })

    if (dw > 0 || dh > 0) {
      setDimensions(width, height)
    }

    animation.onfinish = () => {
      element.style.clipPath = ``
      setDimensions(width, height)
    }

    const oldAnimation = currentAnimation.get(element)
    if (oldAnimation) {
      (oldAnimation.onfinish as any) = undefined
    }

    currentAnimation.set(element, animation)
  })

  return background
}

export function fadeOutElement (element: HTMLElement, onFinish: () => void) {
  element.style.left = px(element.offsetLeft)
  element.style.top = px(element.offsetTop)
  element.style.position = `absolute`

  const animation = element.animate({
    opacity: `0`,
    scale: `0`,
  }, {
    duration: duration.normal,
    easing: `ease`,
  })

  animation.onfinish = onFinish

  return () => {
    element.style.position = ``
    element.style.left = ``
    element.style.top = ``
    animation.cancel()
  }
}