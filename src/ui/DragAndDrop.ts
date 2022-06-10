import CustomEvent from '../CustomEvent'

export default class DragAndDrop<T> {
  onDrag = new CustomEvent<T | null>()

  private payload: T | null = null

  drag (elem: HTMLElement, payload: T, image?: HTMLElement) {
    elem.draggable = true

    elem.addEventListener('dragstart', (e) => {
      e.dataTransfer!.setData('text/plain', (e.target as HTMLElement).innerText)
      if (image) {
        const x = image.offsetWidth / 2
        const y = image.offsetHeight / 2
        e.dataTransfer!.setDragImage(getDragImage(image), x, y)
      }
      this.payload = payload
      this.onDrag.emit(this.payload)
    })

    elem.addEventListener('dragend', () => {
      this.payload = null
      this.onDrag.emit(null)
    })
  }

  drop (
      elem: HTMLElement, isDroppable: (payload: T) => DropEffect | void,
      onDrop: (payload: T) => void) {

    let dropEffect: DropEffect | null = null

    elem.addEventListener('dragenter', (e) => {
      const dropOnParent = e.target === e.currentTarget
      dropEffect = dropOnParent && isDroppable(this.payload!) || null
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

function getDragImage(elem: Element) {
  if (!(elem instanceof HTMLImageElement)) {
    return elem
  }

  const canvas = document.createElement('canvas')
  canvas.width = elem.offsetWidth * window.devicePixelRatio
  canvas.height = elem.offsetHeight * window.devicePixelRatio

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(elem, 0, 0, canvas.width, canvas.height)

  return canvas
}