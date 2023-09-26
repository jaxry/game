import { pushURL } from './url.ts'

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

export function createSpan (
    parent: Element | null, cls?: string, text?: string) {
  return createElement(parent, 'span', cls, text)
}

export function createAnchor (
    parent: Element | null, path: string, cls?: string, text?: string) {
  const anchor = createElement(parent, 'a', cls, text)
  anchor.href = path
  anchor.addEventListener('click', (e) => {
    e.preventDefault()
    pushURL(path)
  })
}

export function createTextNode (parent: Element, text: string) {
  const node = document.createTextNode(text)
  parent.append(document.createTextNode(text))
  return node
}

export function createSvg<T extends keyof SVGElementTagNameMap> (
    parent: Element, tag: T) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
  parent.append(element)
  return element
}



