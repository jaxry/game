import { hoverStyle, makeKeyframes, makeStyle } from './makeStyle'
import { randomSign } from '../util'
import LCH from './LCH'

// Animation duration

const baseSpeed = 800
export const duration = {
  short: baseSpeed / 2,
  normal: baseSpeed,
  long: baseSpeed * 2,
}

// Animations

const fadeInKeyframes = makeKeyframes({ opacity: `0` }, { opacity: `1` })
export const fadeInAnimation = `${fadeInKeyframes} ${duration.short}ms both`

// Element.animate presets

export function fadeIn (element: HTMLElement, animDuration = duration.normal) {
  return element.animate({
    opacity: [`0`, `1`],
    scale: [`0`, `1`],
  }, {
    duration: animDuration,
    easing: `ease`,
  })
}

export function fadeOut (
    element: HTMLElement, onFinish: () => void,
    animDuration = duration.normal) {
  const animation = element.animate({
    opacity: `0`,
    scale: `0`,
  }, {
    duration: animDuration,
    easing: `ease`,
  })

  animation.onfinish = onFinish

  return animation
}

// Colors

export const backgroundColor = new LCH(25, 5, Math.random())

export const textColor = backgroundColor.setL(90)

export const windowColor = `#faa`

export const mapNodeColor = backgroundColor.addL(10)
export const mapNodeDistantColor = `#faa`

export const mapEdgeColor = backgroundColor.addL(20)

export const objectCardColor = new LCH(
    50, 10, backgroundColor.h + randomSign() / 2)

export const objectCardPlayerColor = objectCardColor.addC(25)

export const objectSpeakColor = objectCardColor.setL(textColor.l)

export const actionColor = new LCH(textColor.l, 30,
    objectCardColor.h + randomSign() / 4)
export const actionTimeColor = actionColor.addH(randomSign() / 8)

export const gameDataColor = new LCH(textColor.l, 30,
    backgroundColor.h + randomSign() / 4)

// Properties

export const borderRadius = '0.25rem'

export const dropBorder = `2px dashed #fff8`

export const boxShadow = `0rem 0.1rem 0.5rem #0003`
export const boxShadowLarge = `0rem 0.1rem 1rem #0003`

// Styles

const buttonColor = new LCH(50, 10, backgroundColor.h)

export const buttonStyle = makeStyle({
  color: `inherit`,
  font: `inherit`,
  width: `max-content`,
  padding: `0.25rem 0.5rem`,
  // background: `#fff2`,
  background: `none`,
  // border: `none`,
  // border: `2px solid ${buttonColor.addL(8)}`,
  border: `2px solid #fff3`,
  borderRadius,
})

hoverStyle(buttonStyle, {
  background: `#fff1`,
})

