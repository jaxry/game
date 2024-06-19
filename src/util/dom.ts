export function clearElement (element: HTMLElement) {
  element.replaceChildren()
}

export function areElementSiblings (elem1: HTMLElement, elem2: HTMLElement) {
  return elem1.parentElement === elem2.parentElement && elem1 !== elem2
}

export function swapElements (elem1: HTMLElement, elem2: HTMLElement) {
  const afterElem2 = elem2.nextElementSibling!
  elem1.replaceWith(elem2)
  if (afterElem2 === elem1) {
    elem2.before(elem1)
  } else if (afterElem2) {
    afterElem2.before(elem1)
  } else {
    elem2.parentElement!.append(elem1)
  }
}

let lastZIndex = 0

export function putOnTop (node: HTMLElement) {
  node.style.zIndex = (++lastZIndex).toString()
}