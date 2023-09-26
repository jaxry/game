import Observable from './Observable.ts'
import { Constructor } from './types.ts'

export default class Component<T extends Element = HTMLElement> {
  element: T

  parentComponent?: Component<Element>
  childComponents?: Set<Component<Element>>
  private removeCallbacks: Array<() => void> = []

  constructor (element: T = document.createElement('div') as any) {
    this.element = element
  }

  onInit? (): void

  newComponent<T extends Constructor<Component>> (
      constructor: T,
      ...args: ConstructorParameters<T>) {

    const component = new constructor(...args)
    component.parentComponent = this

    if (!this.childComponents) {
      this.childComponents = new Set()
    }
    this.childComponents.add(component)

    return component as InstanceType<T>
  }

  appendTo (parent: Element) {
    parent.append(this.element)
    this.onInit?.()
    return this
  }

  replace (other: Component) {
    other.element.replaceWith(this.element)
    other.remove()
    this.onInit?.()
    return this
  }

  replaceElement (other: Element) {
    other.replaceWith(this.element)
    this.onInit?.()
    return this
  }

  style (className: string) {
    this.element.classList.add(className)
    return this
  }

  onRemove (unsubscribe: () => void) {
    this.removeCallbacks.push(unsubscribe)
  }

  remove (removeFromDom = true) {
    if (removeFromDom) {
      this.element.remove()
    }

    for (const callback of this.removeCallbacks) {
      callback()
    }
    this.removeCallbacks.length = 0

    if (this.childComponents) {
      for (const component of this.childComponents) {
        component.remove(removeFromDom)
      }
    }

    this.parentComponent?.childComponents!.delete(this)
    this.parentComponent = undefined
  }

  on<T> (event: Observable<T>, observer: (data: T) => void) {
    this.onRemove(event.on(observer))
  }
}