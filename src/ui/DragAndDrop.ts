import CustomEvent from '../CustomEvent'

export default class DragAndDrop<T> {
  onDrag = new CustomEvent<T | null>()

  private payload: T | null = null

  drag(elem: HTMLElement, payload: T, image?: HTMLElement) {
    elem.draggable = true

    elem.addEventListener('dragstart', (e) => {
      e.dataTransfer!.setData('text/plain', (e.target as HTMLElement).innerText)
      if (image) {
        const x = image.offsetWidth / 2 * window.devicePixelRatio
        const y = image.offsetHeight / 2 * window.devicePixelRatio
        e.dataTransfer!.setDragImage(image, x, y)
      }
      this.payload = payload
      this.onDrag.emit(this.payload)
    })

    elem.addEventListener('dragend', () => {
      this.payload = null
      this.onDrag.emit(null)
    })
  }

  drop(
      elem: HTMLElement, isDroppable: (payload: T) => DropEffect | void,
      onDrop: (payload: T) => void) {

    let dropEffect: DropEffect | null = null

    elem.addEventListener('dragenter', (e) => {
      dropEffect = isDroppable(this.payload!) || null
      if (dropEffect) {
        e.stopPropagation()
        e.preventDefault()
      }
    })

    elem.addEventListener('dragover', (e) => {
      if (dropEffect) {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer!.dropEffect = dropEffect
      }
    })

    elem.addEventListener('drop', (e) => {
      e.stopPropagation()
      e.preventDefault()
      onDrop(this.payload!)
    })
  }

}

export type DropEffect = 'copy' | 'move' | 'link'