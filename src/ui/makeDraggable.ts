import throttle from './throttle'

interface OnDrag {
  (
      e: MouseEvent,
      mouseRelative: { x: number, y: number },
      mouseDifference: { x: number, y: number },
  ): void
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
      onUp?: OnDrag,

      startEnabled?: MouseEvent
    }) {

  let startX = 0
  let startY = 0

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
    e.stopPropagation()

    if (onDrag) {
      startX = e.clientX
      startY = e.clientY
      lastX = e.clientX
      lastY = e.clientY
      document.body.addEventListener('mousemove', move)
    }
    if (options.onOver) {
      document.body.addEventListener('mouseover', options.onOver)
    }

    window.addEventListener('mouseup', up, { once: true })
  }

  function calcChange (e: MouseEvent) {
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

  // throttle the mousemove event to the browser's requestAnimationFrame
  // otherwise event gets triggered way more than necessary
  const move = throttle((e: MouseEvent) => {
    if (!onDrag) {
      return
    }
    const { relative, difference } = calcChange(e)
    onDrag(e, relative, difference)
  })

  function up (e: MouseEvent) {
    document.body.removeEventListener('mousemove', move)

    if (options.onOver) {
      document.body.removeEventListener('mouseover', options.onOver)
    }

    const { relative, difference } = calcChange(e)
    options.onUp?.(e, relative, difference)

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