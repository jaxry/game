import { onResize } from './onResize'
import { px } from '../util'
import { duration } from './theme'

export const animatedBackgroundTemplate = {
  position: `absolute`,
  inset: `0`,
  zIndex: `-1`,
}

const latestAnimation = new WeakMap<any, Animation>()

export default function animatedBackground (
    element: HTMLElement, backgroundStyle: string) {
  const background = document.createElement(`div`)
  background.classList.add(backgroundStyle)
  element.prepend(background)

  let currentWidth = element.offsetWidth
  let currentHeight = element.offsetHeight

  const setRenderedDimensions = () => {
    background.style.width = px(currentWidth)
    background.style.height = px(currentHeight)
  }

  setRenderedDimensions()

  const borderRadius = getComputedStyle(background).borderRadius

  onResize(element, (width, height) => {
    element.style.clipPath = `inset(0 round ${borderRadius})`

    const dw = width - currentWidth
    const dh = height - currentHeight
    const animation = element.animate({
      clipPath: [`inset(0 ${dw}px ${dh}px 0)`, `inset(0)`],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `accumulate`,
    })

    const oldWidth = currentWidth
    const oldHeight = currentHeight
    currentWidth = width
    currentHeight = height

    if (oldWidth < currentWidth || oldHeight < currentHeight) {
      setRenderedDimensions()
    }

    latestAnimation.set(element, animation)

    animation.onfinish = () => {
      if (latestAnimation.get(element) === animation) {
        element.style.clipPath = ``
        setRenderedDimensions()
      }
    }
  })

  return background
}

export function fadeOutElement (element: HTMLElement, onFinish: () => void) {
  element.style.left = px(element.offsetLeft)
  element.style.top = px(element.offsetTop)
  element.style.position = `absolute`

  const animation = element.animate({
    scale: `0`,
    opacity: `0`,
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