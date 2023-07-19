import Component, { CanvasPointerEvent } from './Component'

let isDragging = false
let childDragged = false

interface PointerMoveEvent {
  x: number
  y: number
  movementX: number
  movementY: number
}

export default function makeDraggable (
    component: Component,
    options: {
      // if returns false, drag is aborted
      onDown?: (e: CanvasPointerEvent) => boolean | void,
      onDrag?: (e: PointerMoveEvent) => void,
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
      document.body.addEventListener('pointermove', (e) => {
        options.onDrag!({
          x: e.clientX * devicePixelRatio,
          y: e.clientY * devicePixelRatio,
          movementX: e.movementX * devicePixelRatio,
          movementY: e.movementY * devicePixelRatio,
        })
      }, { signal })
    }

    window.addEventListener('pointerup', (e) => {
      options.onUp?.(e)
      childDragged = false
      controller.abort()
    }, { once: true })
  }

  component.addEventListener('pointerdown', down)
}

export function onClickNotDrag (
    component: Component, handler: (e: CanvasPointerEvent) => void) {
  component.addEventListener('click', (e) => {
    if (!isDragging) {
      handler(e)
    }
  })
}