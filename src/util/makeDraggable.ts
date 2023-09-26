let isDragging = false
let childDragged = false

export default function makeDraggable (
    element: Element,
    options: {
      // if returns false, drag is aborted
      onDown?: (e: PointerEvent) => boolean | void,
      onDragStart?: (e: PointerEvent) => void,
      onDrag?: (e: PointerEvent) => void,
      onOver?: (e: PointerEvent) => void,
      onUp?: (e: PointerEvent) => void,
      startEnabled?: PointerEvent
    }) {

  function down (e: PointerEvent) {
    if (childDragged || options.onDown?.(e) === false) {
      return
    }

    childDragged = true
    isDragging = false

    const controller = new AbortController()
    const signal = controller.signal

    window.addEventListener('pointermove', (e) => {
      isDragging = true
      options.onDragStart?.(e)
    }, { once: true, signal })

    if (options.onDrag) {
      window.addEventListener('pointermove', options.onDrag, { signal })
    }

    if (options.onOver) {
      window.addEventListener('pointerover', options.onOver, { signal })
    }

    window.addEventListener('pointerup', (e) => {
      childDragged = false
      options.onUp?.(e)
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

export function cancelDrag (element: Element) {
  element.addEventListener('pointerdown', (e) => {
    childDragged = true
  })
}