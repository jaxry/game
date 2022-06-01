import bBoxDiff from './bBoxDiff'
import animationDuration from './animationDuration'

export function removeElementFromList(
    elem: HTMLElement,
    callback: (child: Element, oldBBox: DOMRect, newBBox: DOMRect) => void) {
  const parentElement = elem.parentElement!

  const bBoxes: DOMRect[] = []

  for (let i = 0; i < parentElement.children.length; i++) {
    const child = parentElement.children[i]
    if (child !== elem) {
      bBoxes.push(child.getBoundingClientRect())
    }
  }

  elem.remove()

  for (let i = 0; i < parentElement.children.length; i++) {
    const child = parentElement.children[i]
    const newBBox = child.getBoundingClientRect()
    callback(child, bBoxes[i], newBBox)
  }
}

export function removeElemAndAnimateList(elem: HTMLElement) {
  removeElementFromList(elem, (child, oldBBox, newBBox) => {
    child.animate([
      { transform: bBoxDiff(oldBBox, newBBox) },
      { transform: `translate(0, 0)` },
    ], {
      duration: animationDuration.normal,
      easing: 'ease-in-out',
      composite: 'accumulate',
    })
  })
}