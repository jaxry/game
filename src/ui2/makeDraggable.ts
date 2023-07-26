import Component, { CanvasPointerEvent } from './Components/Component'

let isDragging = false
let childDragged = false

export default function makeDraggable (
    component: Component,
    options: {
      // if returns false, drag is aborted
      onDown?: (e: CanvasPointerEvent) => boolean | void,
      onDrag?: (e: PointerEvent) => void,
      onUp?: (e: PointerEvent) => void,
    }) {

  function down (e: CanvasPointerEvent) {
    if (childDragged) {
      return
    }

    const returned = options.onDown?.(e)

    if (returned === false) {
      return
    }

    childDragged = true
    isDragging = false

    const controller = new AbortController()
    const signal = controller.signal

    document.body.addEventListener('mousemove', () => {
      isDragging = true
    }, { once: true, signal })

    if (options.onDrag) {
      document.body.addEventListener('pointermove', options.onDrag, { signal })
    }

    window.addEventListener('pointerup', (e) => {
      options.onUp?.(e)
      childDragged = false
      controller.abort()
    }, { once: true })
  }

  component.pointerdown.on(down)
}

export function onClickNotDrag (
    component: Component, handler: (e: CanvasPointerEvent) => void) {
  component.click.on((e) => {
    if (!isDragging) {
      handler(e)
    }
  })
}