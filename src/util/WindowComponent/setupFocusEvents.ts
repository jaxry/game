import Component from '../Component.ts'
import { WindowOptions } from '../makeWindow.ts'

const isWindow = new WeakSet<Component>()
const isFocused = new WeakSet<Component>()
const exitOnPointerLeave = new WeakSet<Component>()

export function setupFocusEvents (
    component: Component, windowElement: HTMLElement, options: WindowOptions) {

  isWindow.add(component)

  if (options.exitOnPointerLeave) {
    exitOnPointerLeave.add(component)
  }

  windowElement.addEventListener('pointerenter', () => {
    for (const window of ancestorWindows(component)) {
      isFocused.add(window)
    }
  })

  windowElement.addEventListener('pointerleave', () => {
    for (const window of ancestorWindows(component)) {
      isFocused.delete(window)
    }
    setTimeout(() => {
      for (const window of ancestorWindows(component)) {
        if (!isFocused.has(window) && exitOnPointerLeave.has(window)) {
          setTimeout(() => window.remove())
        }
      }
    })
  })

  if (options.exitOnOutsideClick) {
    const pointerdown = () => {
      if (!isFocused.has(component)) {
        component.remove()
        window.removeEventListener('pointerdown', pointerdown)
      }
    }
    setTimeout(() => window.addEventListener('pointerdown', pointerdown))
  }
}

function* ancestorWindows (component: Component) {
  while (component) {
    if (isWindow.has(component)) {
      yield component
    }
    component = component.parentComponent! as Component<HTMLElement>
  }
}