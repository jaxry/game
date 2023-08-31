import { hoverStyle, makeKeyframes, makeStyle } from './makeStyle'
import { randomSign } from '../util'
import LCH from './LCH'

// Animation duration

const baseSpeed = 800
export const duration = {
  short: 150,
  normal: baseSpeed,
  long: baseSpeed * 2,
}

// Animations

export const fadeInKeyframes = makeKeyframes({ opacity: `0` }, { opacity: `1` })

// Element.animate presets

export function fadeIn (element: HTMLElement, animDuration = duration.normal) {
  return element.animate({
    opacity: [`0`, `1`],
    scale: [`0`, `1`],
  }, {
    duration: animDuration,
    easing: `ease`,
    delay: animDuration / 4,
    fill: `backwards`,
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

export const backgroundColor = new LCH(20, 5, Math.random())

export const textColor = backgroundColor.setL(90)

export const windowColor = backgroundColor.addL(15).addC(4)
    .addH(randomSign() / 8)

export const mapNodeColor = backgroundColor.addL(10).addC(4)
export const mapNodeSimpleColor = backgroundColor.addL(5)

export const mapEdgeColor = backgroundColor.addL(20)

export const objectCardColor = new LCH(
    50, 10, backgroundColor.h + randomSign() / 2)

export const objectCardPlayerColor = objectCardColor.addC(25)

export const objectTextColor = objectCardColor.setL(textColor.l)

export const actionColor = objectCardColor.setL(textColor.l)
    .addC(25).addH(randomSign() / 4)
export const actionTimeColor = actionColor.addH(randomSign() / 8)

export const gameDataColor = textColor.addC(25).addH(randomSign() / 4)

// Properties

export const borderRadius = '0.25rem'

export const dropBorder = `2px dashed #fff8`

export const boxShadow = `0rem 0.1rem 0.5rem #0003`
export const boxShadowLarge = `0rem 0.5rem 2rem #0004`

// Styles

export const buttonStyle = makeStyle({
  width: `max-content`,
  padding: `0.25rem 0.5rem`,
  border: `2px solid #fff3`,
  borderRadius,
})
hoverStyle(buttonStyle, {
  background: `#fff1`,
})

export const textButtonStyle = makeStyle({})
hoverStyle(textButtonStyle, {
  color: `#fff`,
})

export const dataStyle = makeStyle({
  color: gameDataColor,
})


