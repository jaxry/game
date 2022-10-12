import makeDraggable from './makeDraggable'

export default function panZoom(
    elem: HTMLElement | SVGElement,
    transform: DOMMatrix, onTransform: () => void) {

  makeDraggable(elem, {
    onDrag: (e, movementX, movementY) => {
      transform.translateSelf(movementX / transform.a, movementY / transform.d)
      onTransform()
    }
  })

  elem.addEventListener('wheel', e => {
    const { clientX, clientY, deltaY} = e as WheelEvent

    // const amount = e.deltaMode === 0 ? 1.03 : 1.25
    const amount = 1.10

    const { top, left } = elem.getBoundingClientRect()
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