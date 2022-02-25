import throttle from './throttle'

export default class PanZoom {
  constructor(
      public elem: HTMLElement, public transform: DOMMatrix,
      public onTransform: () => void) {
    let lastX = 0
    let lastY = 0

    this.elem.addEventListener('pointerdown', (e) => {
      if (e.button == 0) {
        lastX = e.clientX
        lastY = e.clientY
        this.elem.addEventListener('pointermove', pointerMove)
        window.addEventListener('pointerup', pointerUp, {once: true})
      }
    })

    const pointerMove = throttle((e: PointerEvent) => {
      const dpr = window.devicePixelRatio
      const mx = e.clientX - lastX
      const my = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      const tx = mx * dpr / this.transform.a
      const ty = my * dpr / this.transform.d
      this.transform.translateSelf(tx, ty)
      this.onTransform()
    })

    const pointerUp = () => {
      this.elem.removeEventListener('pointermove', pointerMove)
    }

    this.elem.addEventListener('wheel', (e) => {
      e.preventDefault()

      const amount = e.deltaMode === 0 ? 1.03 : 1.25

      const {top, left} = this.elem.getBoundingClientRect()
      const x = (e.clientX - left) * window.devicePixelRatio
      const y = (e.clientY - top) * window.devicePixelRatio

      const change = Math.sign(e.deltaY) < 0 ? amount : 1 / amount

      // the mouse position should point to the same location in the model before and after the scale
      // old mouse-model position = new mouse-model position =>
      // (mouse - oldTranslation) / oldScale = (mouse - newTranslation) / newScale
      // solve for newTranslation
      this.transform.e = x - change * (x - this.transform.e)
      this.transform.f = y - change * (y - this.transform.f)
      this.transform.scaleSelf(change)

      this.onTransform()
    })
  }
}