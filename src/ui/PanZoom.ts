import makeDraggable from './makeDraggable'

export default function addPanZoom (
    element: Element, transform: DOMMatrix,
    onTransform: () => void,
) {

  makeDraggable(element, {
    onDrag: (e, relative, difference) => {
      const tx = difference.x / transform.a
      const ty = difference.y / transform.d
      transform.translateSelf(tx, ty)
      onTransform()
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
    transform.e = x - change * (x - transform.e)
    transform.f = y - change * (y - transform.f)
    transform.scaleSelf(change)

    onTransform()
  })
}