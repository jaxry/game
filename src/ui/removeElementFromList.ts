import { duration } from './theme'
import bBoxDiff from '../util'

export function removeElementFromList (
    elem: Element,
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

export function removeElemAndAnimateList (elem: Element) {
  removeElementFromList(elem, (child, oldBBox, newBBox) => {
    child.animate([
      { transform: bBoxDiff(oldBBox, newBBox) },
      { transform: `translate(0, 0)` },
    ], {
      duration: duration.normal,
      easing: 'ease-in-out',
      composite: 'accumulate',
    })
  })
}