import Component from './Component.ts'
import { createDiv } from './createElement.ts'
import { makeStyle } from './makeStyle.ts'
import { clamp, moveToTop } from './util.ts'
import { setupFocusEvents } from './WindowComponent/setupFocusEvents.ts'
import { makeResizable } from './WindowComponent/makeResizable.ts'
import { setupExitButton } from './WindowComponent/setupExitButton.ts'
import { setupDragging } from './WindowComponent/setupDragging.ts'

export const windowContainer = createDiv(null, makeStyle({
  position: `fixed`,
  zIndex: `1`,
}))

const defaultOptions = {
  draggable: false,
  exitOnOutsideClick: false,
  exitOnPointerLeave: false,
  exitButton: false,
  resizable: false,
  pointerEvents: true,
}

export type WindowOptions = typeof defaultOptions

export function makeWindow (
    component: Component, userOptions: Partial<WindowOptions> = {}) {
  const options = { ...defaultOptions, ...userOptions }

  const windowDiv = createDiv(windowContainer, windowStyle)

  if (!options.pointerEvents) windowDiv.style.pointerEvents = `none`

  component.element.classList.add(contentStyle)
  component.appendTo(windowDiv)

  setupFocusEvents(component, windowDiv, options)

  if (options.draggable) {
    setupDragging(windowDiv)
  }
  if (options.resizable) {
    makeResizable(windowDiv)
  }
  if (options.exitButton) {
    setupExitButton(component, windowDiv)
  }

  moveToTop(windowDiv)
  windowDiv.addEventListener('pointerdown', (e) => moveToTop(windowDiv))

  new MutationObserver(() => {
    if (component.element.parentElement !== windowDiv) {
      windowDiv.remove()
    }
  }).observe(windowDiv, {
    childList: true,
  })

  return component
}

export function setWindowPosition (
    component: Component, x: number, y: number, center = false) {
  setWindowElementPosition(component.element.parentElement!, x, y, center)
}

export function setWindowElementPosition (
    element: HTMLElement, x: number, y: number, center = false) {
  const width = element.offsetWidth
  const height = element.offsetHeight

  x = center ? x - width / 2 : x
  y = center ? y - height / 2 : y

  x = clamp(0, window.innerWidth - width, x)
  y = clamp(0, window.innerHeight - height, y)
  element.style.translate = `${x}px ${y}px`
}

const windowStyle = makeStyle({
  position: `fixed`,
})

const contentStyle = makeStyle({
  width: `100%`,
  height: `100%`,
  overflow: `auto`,
})