import { createDiv } from '../createElement.ts'
import { addStyle, makeStyle } from '../makeStyle.ts'
import Component from '../Component.ts'

export function setupExitButton (component: Component, element: HTMLElement) {
  const exit = createDiv(element, exitButtonStyle, `✕`)
  exit.addEventListener('click', () => component.remove())
}

const exitButtonStyle = makeStyle({
  position: `absolute`,
  top: `0`,
  right: `0rem`,
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
  width: `2rem`,
  height: `2rem`,
  fontSize: `1.25rem`,
  lineHeight: `0`,
})

addStyle(`.${exitButtonStyle}:hover`, {
  background: `#fff1`,
})
addStyle(`.${exitButtonStyle}:active`, {
  background: `#fff2`,
})