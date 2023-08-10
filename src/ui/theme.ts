import { addStyle, makeKeyframes, makeStyle } from './makeStyle'
import { mod, randomSign } from '../util'
import LCH from './LCH'

// Animation duration

const baseSpeed = 600
export const duration = {
  short: baseSpeed / 2,
  normal: baseSpeed,
  long: baseSpeed * 2,
}

// Animations

const fadeInKeyframes = makeKeyframes({ opacity: `0` }, { opacity: `1` })
export const fadeInAnimation = `${fadeInKeyframes} ${duration.short}ms both`

// Element.animate presets

export function fadeIn (element: HTMLElement) {
  return element.animate({
    opacity: [`0`, `1`],
    scale: [`0`, `1`],
  }, {
    duration: duration.normal,
    easing: `ease`,
  })
}

export function fadeOut (element: HTMLElement, onFinish: () => void) {
  const animation = element.animate({
    opacity: `0`,
    scale: `0`,
  }, {
    duration: duration.normal,
    easing: `ease`,
  })

  animation.onfinish = onFinish

  return animation
}

// Colors

export const backgroundColor = new LCH(25, 5, Math.random())

export const fontColor = backgroundColor.setL(90)

export const windowColor = `#faa`

export const mapNodeColor = backgroundColor.addL(10)
export const mapNodeDistantColor = `#faa`

export const mapEdgeColor = backgroundColor.addL(20)

export const objectCardColor = new LCH(
    50, 10, backgroundColor.h + randomSign() / 2)

export const objectCardPlayerColor = objectCardColor.addC(25)

export const objectSpeakColor = objectCardColor.setL(fontColor.l)

export const actionColor = new LCH(fontColor.l, 30,
    objectCardColor.h + randomSign() / 4)
export const actionTimeColor = actionColor.addH(randomSign() / 8)

export const gameDataColor = new LCH(fontColor.l, 30,
    backgroundColor.h + randomSign() / 4)

// Properties

export const borderRadius = '0.25rem'

export const dropBorder = `2px dashed #fff8`

export const boxShadow = `0rem 0.25rem 0.5rem #0003`
export const boxShadowLarge = `0rem 0.25rem 1rem #0003`

// Styles

export const buttonStyle = makeStyle({
  padding: `0.25rem 0.5rem`,
  color: `#faa`,
})

addStyle(`.${buttonStyle}:hover`, {
  background: `#fff2`,
  borderRadius,
})

