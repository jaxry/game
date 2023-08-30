export default class DragAndDrop<T> {
  private callbacks = new Map<Element, Callbacks<T>>()
  private dropEffect = new WeakMap<Element, DropEffect | false>()
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

      for (const [element, { isDroppable }] of this.callbacks) {
        this.dropEffect.set(element, isDroppable(payload))
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
    this.callbacks.set(element, callbacks)

    element.addEventListener('dragover', (e) => {
      const dropEffect = this.dropEffect.get(element)
      if (dropEffect) {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer!.dropEffect = dropEffect
      }
    })

    element.addEventListener('drop', (e) => {
      e.stopPropagation()
      e.preventDefault()
      callbacks.onDrop(this.payload!, e)
    })

    return () => {
      this.callbacks.delete(element)
    }
  }
}

interface Callbacks<T> {
  isDroppable: (payload: T) => DropEffect | false,
  onDrop: (payload: T, event: DragEvent) => void,
  onDone?: () => void
}

export type DropEffect = 'copy' | 'move' | 'link'