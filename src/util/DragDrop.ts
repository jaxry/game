import Component from './Component.ts'
import { Falsy } from './types.ts'

export class DragDrop<T> {
  payload: T
  isDroppable = new Map<Component, (data: T) => DropEffect | Falsy>
  dropEffects = new WeakMap<Component, DropEffect | Falsy>
  dropStyle = new WeakMap<Component, string>

  drag (data: T) {
    return (c: Component) => {
      c.element.draggable = true
      c
        .on('dragstart', e => {
          this.payload = data

          for (const [component, isDroppable] of this.isDroppable) {
            const droppable = isDroppable(this.payload)
            if (!droppable) {
              continue
            }
            this.dropEffects.set(component, droppable)
            component.style(this.dropStyle.get(component)!)
          }
        })
        .on('dragend', e => {
          for (const component of this.isDroppable.keys()) {
            component.removeStyle(this.dropStyle.get(component)!)
          }
        })
    }
  }

  drop (
    isDroppable: (data: T) => DropEffect | Falsy, onDrop: (data: T) => void,
    droppableStyle = '') {
    return (c: Component) => {
      c
        .onMount(() => {
          this.isDroppable.set(c, isDroppable)
          this.dropStyle.set(c, droppableStyle)
          return () => this.isDroppable.delete(c)
        })
        .on('dragover', (e) => {
          const effect = this.dropEffects.get(c)
          if (effect) {
            e.dataTransfer!.dropEffect = effect
            e.preventDefault()
          }
        })
        .on('drop', e => {
          onDrop(this.payload)
          e.preventDefault()
        })
    }
  }
}

export type DropEffect = 'copy' | 'move' | 'link'