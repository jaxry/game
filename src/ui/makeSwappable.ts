import makeDraggable from '../util/makeDraggable.ts'
import { makeStyle } from '../util/makeStyle.ts'
import { areElementSiblings, swapElements } from '../util/util.ts'

export default function makeSwappable (element: HTMLElement) {
  let tx = 0
  let ty = 0
  makeDraggable(element, {
    onDown: () => {
      tx = 0
      ty = 0
      element.classList.add(draggingStyle)
    },
    onDrag: (e) => {
      tx += e.movementX
      ty += e.movementY
      element.style.translate = `${tx}px ${ty}px`
    },
    onOver: (e) => {
      if (!areElementSiblings(element, e.target as HTMLElement)) return
      let { offsetLeft, offsetTop } = element
      swapElements(element, e.target as HTMLElement)
      tx -= element.offsetLeft - offsetLeft
      ty -= element.offsetTop - offsetTop
    },
    onUp: (e) => {
      element.classList.remove(draggingStyle)
      element.style.translate = ``
      // if (!areElementSiblings(element, e.target as HTMLElement)) return
      // swapElements(element, e.target as HTMLElement)

    },
  })
}

const draggingStyle = makeStyle({
  pointerEvents: `none`,
  opacity: `0.75`,
})