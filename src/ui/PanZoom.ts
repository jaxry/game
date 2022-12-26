import makeDraggable from './makeDraggable'

interface Transform {
  x: number
  y: number
  scale: number
}

export default function addPanZoom (
    element: Element, transform: Transform,
    onTransform: (scale: boolean) => void,
) {

  makeDraggable(element, {
    onDrag: (e, relative, difference) => {
      transform.x += difference.x
      transform.y += difference.y
      onTransform(false)
    },
  })

  element.addEventListener('wheel', (e) => {
    e.preventDefault()

    const { clientX, clientY, deltaY } = e as WheelEvent

    const amount = 1.10

    const { top, left } = element.getBoundingClientRect()
    const x = clientX - left
    const y = clientY - top

    const change = Math.sign(deltaY) < 0 ? amount : 1 / amount

    // the mouse position should point to the same location in the model before and after the scale
    // old mouse-model position = new mouse-model position =>
    // (mouse - oldTranslation) / oldScale = (mouse - newTranslation) / newScale
    // solve for newTranslation
    transform.x = x - change * (x - transform.x)
    transform.y = y - change * (y - transform.y)
    transform.scale *= change

    onTransform(true)
  })
}