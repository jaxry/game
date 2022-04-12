export default function removeElementFromList(
    elem: HTMLElement,
    callback: (child: Element, oldBBox: DOMRect, newBBox: DOMRect) => void) {
  const parentElement = elem.parentElement!
  const elemIndex = indexOfElement(elem)

  const children: Element[] = []
  const bBoxes: DOMRect[] = []

  for (let i = elemIndex + 1; i < parentElement.children.length; i++) {
    const child = parentElement.children[i]
    children.push(child)
    bBoxes.push(child.getBoundingClientRect())
  }

  elem.remove()

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const newBBox = child.getBoundingClientRect()
    callback(child, bBoxes[i], newBBox)
  }
}

function indexOfElement(elem: HTMLElement) {
  const parentElement = elem.parentElement!
  for (let i = 0; i < parentElement.children.length; i++) {
    if (parentElement.children[i] === elem) {
      return i
    }
  }
  return -1
}
