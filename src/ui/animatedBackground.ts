import { onResize } from './onResize'
import { numToPx } from '../util'
import { duration } from './theme'
import { createDiv } from './createElement'

export const animatedBackgroundTemplate = {
  position: `absolute`,
  inset: `0`,
  zIndex: `-1`,
}

const latestAnimation = new WeakMap<any, Animation>()

export default function animatedBackground (element: HTMLElement, style: string) {
  const background = createDiv(element, style)

  let currentWidth = element.offsetWidth
  let currentHeight = element.offsetHeight

  background.style.width = numToPx(currentWidth)
  background.style.height = numToPx(currentHeight)

  const borderRadius = getComputedStyle(background).borderRadius

  onResize(element, (width, height) => {
    element.style.clipPath = `inset(0 round ${borderRadius})`

    const dw = width - currentWidth
    const dh = height - currentHeight
    const animation = element.animate({
      clipPath: [
        `inset(0 ${dw}px ${dh}px 0)`,
        `inset(0 0 0 0)`,
      ],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `accumulate`,
    })

    latestAnimation.set(element, animation)

    const setDimensions = () => {
      background.style.width = numToPx(width)
      background.style.height = numToPx(height)
    }

    animation.onfinish = () => {
      if (latestAnimation.get(element) === animation) {
        element.style.clipPath = ``
        setDimensions()
      }
    }

    if (currentWidth < width || currentHeight < height) {
      setDimensions()
    }

    currentWidth = width
    currentHeight = height
  })

  return background
}

export function fadeOutElement (element: HTMLElement, onFinish: () => void) {
  const left = element.offsetLeft
  const top = element.offsetTop
  element.style.position = `absolute`
  element.style.left = numToPx(left)
  element.style.top = numToPx(top)

  const animation = element.animate({
    scale: `0`,
    opacity: `0`
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