import { addStyle, makeKeyframes, makeStyle } from '../util/makeStyle.ts'
import LCH from '../util/LCH.ts'
import Entity from '../Entity.ts'
import { makeOrGet } from '../util/util.ts'

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
    scale: [`0.5`, `1`],
  }, {
    duration: animDuration,
    easing: `ease`,
    fill: `backwards`,
  })
}

export function fadeOut (
    element: HTMLElement, onFinish: () => void,
    animDuration = duration.normal) {
  const animation = element.animate({
    opacity: `0`,
    scale: `0.5`,
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
export const minorTextColor = backgroundColor.setL(80)

export const windowColor = backgroundColor.addL(15)

export const mapCellColor = backgroundColor.addL(20).addC(5)
export const mapCenterColor = mapCellColor.addL(20).addC(15)

let hueMap = new WeakMap<Entity, number>()

export function entityBackgroundColor (entity: Entity) {
  const hue = makeOrGet(hueMap, entity, () => Math.random())
  return new LCH(50, 70, hue)
}

export function entityForegroundColor (entity: Entity) {
  return entityBackgroundColor(entity).addL(20)
}

// Properties

export const borderRadius = '2px'

export const windowTheme = {
  background: windowColor,
  boxShadow: `0rem 0.1rem 0.5rem #0003`,
  padding: `1rem`,
}

// Styles

export const buttonStyle = makeStyle({
  width: `max-content`,
  padding: `0.25rem 0.5rem`,
  border: `2px solid #fff3`,
  borderRadius,
})

addStyle(`.${buttonStyle}:hover`, {
  background: `#fff1`,
})

export const textButtonStyle = makeStyle()
addStyle(`.${textButtonStyle}:hover`, {
  color: `#fff`,
})

export const nonBreakingSpace = String.fromCharCode(160)


