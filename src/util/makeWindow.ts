import Component from './Component.ts'
import { createDiv } from './createElement.ts'
import { makeStyle } from './makeStyle.ts'
import { clamp, putOnTop } from './util.ts'
import { setupFocusEvents } from './WindowComponent/setupFocusEvents.ts'
import { makeResizable } from './WindowComponent/makeResizable.ts'
import { setupExitButton } from './WindowComponent/setupExitButton.ts'
import { setupDragging } from './WindowComponent/setupDragging.ts'

const windowContainer = createDiv(document.body, makeStyle({
  position: `fixed`,
  zIndex: `2147483647`,
}))

const defaultOptions = {
  draggable: false,
  exitOnOutsideClick: false,
  exitOnPointerLeave: false,
  exitButton: false,
  resizable: false,
  pointerEvents: true,
  maxSize: 100,
}

export type WindowOptions = typeof defaultOptions

export function makeWindow (
    component: Component, userOptions: Partial<WindowOptions> = {}) {
  const options = { ...defaultOptions, ...userOptions }

  const windowDiv = createDiv(windowContainer, windowStyle)

  if (!options.pointerEvents) windowDiv.style.pointerEvents = `none`

  component.element.classList.add(contentStyle)
  component.element.style.maxWidth = `${options.maxSize}vw`
  component.element.style.maxHeight = `${options.maxSize}vh`
  component.appendTo(windowDiv)

  setupFocusEvents(component, windowDiv, options)

  if (options.draggable) {
    setupDragging(windowDiv)
  }
  if (options.resizable) {
    makeResizable(windowDiv, component.element)
  }
  if (options.exitButton) {
    setupExitButton(component, windowDiv)
  }

  putOnTop(windowDiv)
  windowDiv.addEventListener('pointerdown', (e) => putOnTop(windowDiv))

  new MutationObserver(() => {
    if (component.element.parentElement !== windowDiv) {
      windowDiv.remove()
    }
  }).observe(windowDiv, {
    childList: true,
  })

  return component
}

export function getWindowElement (component: Component) {
  return component.element.parentElement!
}

export function setWindowPosition (
    component: Component, x: number, y: number, center = false) {
  setWindowElementPosition(getWindowElement(component), x, y, center)
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
  overflow: `auto`,
})