

export default class DragAndDrop<T> {
  callbacks = new Map<Element, Callbacks<T>>()

  private payload: T | null = null

  drag (elem: HTMLElement, payload: T, image?: HTMLElement) {
    elem.draggable = true

    elem.addEventListener('dragstart', (e) => {
      e.dataTransfer!.setData('text/plain', (e.target as HTMLElement).innerText)
      if (image) {
        const x = image.offsetWidth / 2 * window.devicePixelRatio
        const y = image.offsetHeight / 2 * window.devicePixelRatio
        e.dataTransfer!.setDragImage(image, x, y)
      }
      this.payload = payload
      for (const { isDroppable } of this.callbacks.values()) {
        isDroppable(payload)
      }
    })

    elem.addEventListener('dragend', () => {
      this.payload = null
      for (const { onDone } of this.callbacks.values()) {
        onDone?.()
      }
    })

    // stops dragging and other events on the parent element
    elem.addEventListener('mousedown', (e) => {
      e.stopPropagation()
    })
  }

  drop (element: HTMLElement, callbacks: Callbacks<T>) {
    const { isDroppable, onDrop } = callbacks

    this.callbacks.set(element, callbacks)

    let dropEffect: DropEffect | false = false

    element.addEventListener('dragenter', (e) => {
      // prevent unnecessary calls to this method
      if (e.target !== e.currentTarget) {
        return
      }

      dropEffect = isDroppable(this.payload!)

      if (dropEffect) {
        e.stopPropagation()
        e.preventDefault()
      }
    })

    element.addEventListener('dragover', (e) => {
      if (dropEffect) {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer!.dropEffect = dropEffect
      }
    })

    element.addEventListener('drop', (e) => {
      e.stopPropagation()
      e.preventDefault()
      if (isDroppable(this.payload!)) {
        onDrop(this.payload!)
      }
    })

    return () => {
      this.callbacks.delete(element)
    }
  }
}

interface Callbacks<T> {
  isDroppable: (payload: T) => DropEffect | false,
  onDrop: (payload: T) => void,
  onDone?: () => void
}

export type DropEffect = 'copy' | 'move' | 'link'