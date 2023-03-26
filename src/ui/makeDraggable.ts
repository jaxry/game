import throttle from './throttle'

let isDragging = false
let childDrag = false

export default function makeDraggable (
    element: Element,
    options: {
      onDrag?: OnDrag,

      // if returns false, drag is aborted
      onDown?: (e: MouseEvent) => boolean | void,

      onOver?: (e: MouseEvent) => void,
      onUp?: OnDrag,

      startEnabled?: MouseEvent
    }) {

  function down (e: MouseEvent) {
    if (childDrag) {
      return
    }

    const returned = options.onDown?.(e)

    if (returned === false) {
      return
    }

    childDrag = true
    isDragging = false

    initPositions(e)

    const controller = new AbortController()
    const signal = controller.signal

    document.body.addEventListener('mousemove', () => {
      isDragging = true
    }, { once: true, signal })

    if (options.onDrag) {
      document.body.addEventListener('mousemove', throttle((e: MouseEvent) => {
        // Throttle the mousemove event to the browser's requestAnimationFrame,
        // otherwise event gets triggered way more than necessary.
        // move() might be called after mouse up due to throttling.
        // return if this is the case
        if (!isDragging) {
          return
        }
        const { relative, difference } = calcPositionChange(e)
        options.onDrag!(e, relative, difference)
      }), { signal })
    }

    if (options.onOver) {
      document.body.addEventListener('mouseover', options.onOver, { signal })
    }

    window.addEventListener('mouseup', (e) => {
      const { relative, difference } = calcPositionChange(e)
      options.onUp?.(e, relative, difference)
      childDrag = false
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
      console.log('click')
      handler(e)
    }
  })
}

interface OnDrag {
  (
      e: MouseEvent,
      mouseRelative: { x: number, y: number },
      mouseDifference: { x: number, y: number },
  ): void
}

let startX = 0
let startY = 0
let lastX = 0
let lastY = 0

function initPositions (e: MouseEvent) {
  startX = e.clientX
  startY = e.clientY
  lastX = e.clientX
  lastY = e.clientY
}

function calcPositionChange (e: MouseEvent) {
  const relative = {
    x: e.clientX - startX,
    y: e.clientY - startY,
  }
  const difference = {
    x: e.clientX - lastX,
    y: e.clientY - lastY,
  }
  lastX = e.clientX
  lastY = e.clientY
  return { relative, difference }
}