import Component, { ComponentChild, div, element } from '../util/Component.ts'
import { addStyle, makeStyle } from '../util/makeStyle.ts'
import LCH from '../util/LCH.ts'
import {
  borderRadius, frameBackground, lightBackground, primary,
} from './theme.ts'
import { makeContextMenu } from '../util/makeContextMenu.ts'

// Containers

export function vertical (...content: ComponentChild[]) {
  return div(...content).style(verticalStyle)
}

const verticalStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
  gap: 1,
})

export function verticalHalf (...content: ComponentChild[]) {
  return div(...content).style(verticalHalfStyle)
}

const verticalHalfStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
  gap: 0.5,
})

export function horizontal (...content: ComponentChild[]) {
  return div(...content).style(horizontalStyle)
}

const horizontalStyle = makeStyle({
  display: `flex`,
  flexWrap: `wrap`,
  alignItems: `center`,
  gap: 1,
})

export function horizontalHalf (...content: ComponentChild[]) {
  return div(...content).style(horizontalHalfStyle)
}

const horizontalHalfStyle = makeStyle({
  display: `flex`,
  flexWrap: `wrap`,
  alignItems: `center`,
  gap: 0.5,
})

// Button

export function button (name: ComponentChild, click: (e: MouseEvent) => void) {
  return element('button')
    .style(buttonStyle)
    .add(name)
    .on('click', click)
}

const buttonStyle = makeStyle({
  width: `max-content`,
  padding: `0.25rem 0.5rem`,
  borderRadius,
  background: new LCH(50, 0, primary),
})
addStyle(`.${buttonStyle}:hover`, {
  background: new LCH(55, 0, primary),
})

addStyle(`.${buttonStyle}:active`, {
  background: new LCH(60, 0, primary),
})

// Menu

export function menu (...content: ComponentChild[]) {
  return div(...content).style(menuStyle)
}

const menuStyle = makeStyle({
  background: frameBackground,
  borderRadius,
})

export function menuPadded (...content: ComponentChild[]) {
  return div(...content).style(menuPaddedStyle)
}

const menuPaddedStyle = makeStyle({
  background: frameBackground,
  borderRadius,
  padding: 0.5,
})

// Entry Maker

export function menuAction (name: string, action: () => void) {
  return div()
    .style(entryStyle)
    .add(name)
    .on('click', action)
}

export function menuActions (context = makeContextMenu()) {
  return {
    submenu: (name: string, submenu: () => Component) =>
      div()
        .style(entryStyle, horizontalStyle)
        .do(context(hover, submenu))
        .add(
          div().style(submenuEntry).add(name),
          div().add(`>`),
        )
    ,
    action: (name: string, action: () => void) =>
      menuAction(name, action).do(context(hover))
  }
}

const entryStyle = makeStyle({
  padding: `0.5rem 1rem`,
})
const submenuEntry = makeStyle({
  flex: `1 0 auto`,
})
const hover = makeStyle({
  background: new LCH(50, 50, primary),
})

// stuff

export function section (...content: ComponentChild[]) {
  return horizontal(...content).style(sectionStyle)
}

const sectionStyle = makeStyle({
  background: lightBackground,
  padding: 1,
  borderRadius,
})

export function title (...content: ComponentChild[]) {
  return div(...content).style(titleStyle)
}

const titleStyle = makeStyle({
  // fontWeight: 'bold',
  fontSize: 1.125,
})

// Number Vis

export function numberVis (x: number, scale = 1 / 4) {
  const side = Math.sqrt(Math.abs(x)) * scale
  return div().style(square).inline({
    width: side,
    height: side,
  })
}

const square = makeStyle({
  background: new LCH(675, 50, primary),
})

