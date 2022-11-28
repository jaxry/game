import Observer from '../Observer'
import makeDraggable from './makeDraggable'
import { numToPx } from '../util'

export default class DragAndDrop<T> {
  onDrag = new Observer<T | null>()

  drag (element: Elem, payload: T) {
    makeDraggable(element, {
      onDrag: (e, x, y) => {
        element.style.transform = `translate(${numToPx(x)}, ${numToPx(y)})`
        element.style.opacity = `0.7`
        element.style.pointerEvents = `none`
      },
      onUp: (e) => {
        element.style.transform = ``
        element.style.opacity = ``
        element.style.pointerEvents = ``

        const event = new CustomEvent(`customDrop`, {
          detail: {
            payload,
            mouseEvent: e,
          },
          bubbles: true,
        })
        e.target!.dispatchEvent(event)
      },
    })
  }

  drop (
      element: Elem,
      onDrop: (payload: T, event: MouseEvent) => void,
  ) {
    element.addEventListener(`customDrop`, (event) => {
      const e = event as CustomEvent<{ payload: T, mouseEvent: MouseEvent }>
      onDrop(e.detail.payload, e.detail.mouseEvent)
      e.stopPropagation()
    })
  }
}

type Elem = HTMLElement | SVGElement