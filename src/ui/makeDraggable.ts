import throttle from './throttle'

interface OnDrag {
  (e: MouseEvent, movementX: number, movementY: number): void
}

export default function makeDraggable (
    element: Element,
    options: {
      onDrag?: OnDrag,

      // if returns false, drag is aborted
      // if returns callback, this callback will be used instead of options.onDrag
      // otherwise, options.onDrag will be the drag callback
      onDown?: (e: MouseEvent) => boolean | OnDrag | void,

      onOver?: (e: MouseEvent) => void,
      onUp?: (e: MouseEvent) => void,

      startEnabled?: MouseEvent
    }) {

  let lastX = 0
  let lastY = 0
  let onDrag: OnDrag | undefined

  function down (e: MouseEvent) {
    const returned = options.onDown?.(e)
    if (returned === false) {
      return
    } else if (returned instanceof Function) {
      onDrag = returned
    } else if (options.onDrag) {
      onDrag = options.onDrag
    } else if (!options.onOver) {
      return
    }

    e.preventDefault()

    if (onDrag) {
      lastX = e.clientX
      lastY = e.clientY
      document.body.addEventListener('mousemove', move)
    }
    if (options.onOver) {
      document.body.addEventListener('mouseover', options.onOver)
    }

    window.addEventListener('mouseup', up, { once: true })
  }

  // throttle the mousemove event to the browser's requestAnimationFrame
  // otherwise even gets triggered way more than necessary
  const move = throttle((e: MouseEvent) => {
    // is sometimes called after mouseup because of throttle
    if (!onDrag) {
      return
    }
    // Bugged on Chrome and doesn't provide accurate numbers?
    const movementX = e.clientX - lastX
    const movementY = e.clientY - lastY
    onDrag(e, movementX, movementY)
    lastX = e.clientX
    lastY = e.clientY
  })

  function up (e: MouseEvent) {
    document.body.removeEventListener('mousemove', move)

    if (options.onOver) {
      document.body.removeEventListener('mouseover', options.onOver)
    }

    options.onUp?.(e)

    onDrag = undefined
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