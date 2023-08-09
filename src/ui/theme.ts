import { addStyle, makeKeyframes, makeStyle } from './makeStyle'
import { mod, randomSign } from '../util'

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

function lch (l: number, c: number, h: number) {
  return `oklch(${l}% ${c * 0.4 / 100} ${mod(h, 1) * 360})`
}

const backgroundL = 25
const backgroundC = 5
const backgroundH = Math.random()

const objectL = 50
const objectC = 10
const objectH = backgroundH + randomSign() / 2

export const backgroundColor = lch(backgroundL, backgroundC, backgroundH)
export const fontColor = lch(95, backgroundC, backgroundH)

export const windowColor = `#faa`

export const mapNodeColor = lch(backgroundL + 10, backgroundC, backgroundH)
export const mapNodeDistantColor = `#faa`

export const mapEdgeColor = lch(backgroundL + 20, backgroundC, backgroundH)

export const objectCardColor = lch(objectL, objectC, objectH)
export const objectCardPlayerColor = `#faa`
export const objectDialogueBackground = `#faa`

const actionL = 90
const actionC = 30
const actionH = objectH + randomSign() / 3
export const actionColor = lch(actionL, actionC, actionH)
export const actionTimeColor = lch(actionL, actionC, actionH + randomSign() / 6)

export const gameDataColor = lch(90, 30, backgroundH + randomSign() / 4)

// Properties

export const borderRadius = '0.25rem'

export const dropBorder = `2px dashed #fff8`

export const boxShadow = `0.25rem 0.25rem 0.5rem #0003`
export const boxShadowLarge = `0.5rem 0.5rem 1rem #0006`

// Styles

export const buttonStyle = makeStyle({
  padding: `0.25rem 0.5rem`,
  color: `#faa`,
})

addStyle(`.${buttonStyle}:hover`, {
  background: `#fff2`,
  borderRadius,
})

