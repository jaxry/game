import Component from './components/Component'

type Elem = keyof HTMLElementTagNameMap | HTMLElement | Component
type Styles = string | string[] | null
type Content = string | (Elem | Args)[]
type Args = [elem: Elem, styles?: Styles, content?: Content]

function makeDomTree(
    component: Component,
    styles?: Styles,
    content?: Content): HTMLElement;

function makeDomTree<T extends Element>(
    element: T,
    styles?: Styles,
    content?: Content): T;


function makeDomTree<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    styles?: Styles,
    content?: Content): HTMLElementTagNameMap[T];

function makeDomTree(elem: Elem, styles?: Styles, content?: Content): HTMLElement {
  let node = getNode(elem)

  if (styles) {
    Array.isArray(styles) ?
        node.classList.add(...styles) :
        node.classList.add(styles)
  }

  if (content) {
    if (Array.isArray(content)) {
      for (const child of content) {
        node.append(
            // @ts-ignore: bug?
            Array.isArray(child) ? makeDomTree(...child) : getNode(child)
        )
      }
    } else {
      node.append(content)
    }
  }

  return node
}

function getNode(elem: Elem) {
  if (elem instanceof Component) {
    return elem.element
  } else if (typeof elem === 'string') {
    return document.createElement(elem)
  } else {
    return elem
  }
}

export default makeDomTree