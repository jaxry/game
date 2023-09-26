import makeDraggable from '../makeDraggable.ts'
import { setWindowElementPosition } from '../makeWindow.ts'

export function setupDragging (element: HTMLElement) {
  let dx = 0
  let dy = 0
  makeDraggable(element, {
    onDragStart: (e) => {
      const { x, y } = element.getBoundingClientRect()
      dx = e.clientX - x
      dy = e.clientY - y
    },
    onDrag: (e) => {
      setWindowElementPosition(element, e.clientX - dx, e.clientY - dy)
    },
  })
}