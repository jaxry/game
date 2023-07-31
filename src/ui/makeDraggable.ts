let isDragging = false
let childDragged = false

export default function makeDraggable (
    element: Element,
    options: {
      // if returns false, drag is aborted
      onDown?: (e: PointerEvent) => boolean | void,
      onDrag?: (e: PointerEvent) => void,
      onOver?: (e: PointerEvent) => void,
      onUp?: (e: PointerEvent) => void,
      startEnabled?: PointerEvent
    }) {

  function down (e: PointerEvent) {
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

    document.body.addEventListener('pointermove', () => {
      isDragging = true
    }, { once: true, signal })

    if (options.onDrag) {
      document.body.addEventListener('pointermove', options.onDrag, { signal })
    }

    if (options.onOver) {
      document.body.addEventListener('pointerover', options.onOver, { signal })
    }

    window.addEventListener('pointerup', (e) => {
      options.onUp?.(e)
      childDragged = false
      controller.abort()
    }, { once: true })
  }

  (element as HTMLElement).addEventListener('pointerdown', down)

  if (options.startEnabled) {
    down(options.startEnabled)
  }

  return () => {
    (element as HTMLElement).removeEventListener('pointerdown', down)
  }
}

export function onClickNotDrag (
    element: HTMLElement, handler: (e: MouseEvent) => void) {
  element.addEventListener('click', (e) => {
    if (!isDragging) {
      handler(e)
    }
  })
}