let isDragging = false
let childDragged = false

export default function makeDraggable (
    element: Element,
    options: {
      // if returns false, drag is aborted
      onDown?: (e: MouseEvent) => boolean | void,
      onDrag?: (e: MouseEvent) => void,
      onOver?: (e: MouseEvent) => void,
      onUp?: (e: MouseEvent) => void,
      startEnabled?: MouseEvent
    }) {

  function down (e: MouseEvent) {
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
      document.body.addEventListener('mousemove', options.onDrag, { signal })
    }

    if (options.onOver) {
      document.body.addEventListener('mouseover', options.onOver, { signal })
    }

    window.addEventListener('mouseup', (e) => {
      options.onUp?.(e)
      childDragged = false
      controller.abort()
    }, { once: true })
  }

  (element as HTMLElement).addEventListener('mousedown', down)

  if (options.startEnabled) {
    const event = options.startEnabled
    setTimeout(() => down(event))
  }

  return () => {
    (element as HTMLElement).removeEventListener('mousedown', down)
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