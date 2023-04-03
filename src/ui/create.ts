export function createElement<T extends keyof HTMLElementTagNameMap>
(
    parent: Element | null, tag: T, cls?: string,
    text?: string): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag)

  if (parent) {
    parent.append(element)
  }
  if (cls) {
    element.classList.add(cls)
  }
  if (text) {
    element.textContent = text
  }

  return element
}

export function createDiv (
    parent: Element | null, cls?: string, text?: string) {
  return createElement(parent, 'div', cls, text)
}

export function createSvg<T extends keyof SVGElementTagNameMap>
(parent: Element, tag: T) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
  parent.append(element)
  return element
}



