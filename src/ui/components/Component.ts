import Observable from '../../Observable'
import { Constructor } from '../../types'

export default class Component<T extends Element = HTMLElement> {
  element: T

  parentComponent?: Component<Element>
  childComponents = new Set<Component<Element>>()
  private destroyCallbacks: Array<() => void> = []

  constructor (element: T = document.createElement('div') as any) {
    this.element = element
  }

  newComponent<T extends Constructor<Component>> (
      constructor: T,
      ...args: ConstructorParameters<T>) {

    const component = new constructor(...args)
    component.parentComponent = this

    this.childComponents.add(component)

    return component as InstanceType<T>
  }

  appendTo (parent: Element) {
    parent.append(this.element)
    this.onInit?.()
    return this
  }

  putBefore (element: Element) {
    element.before(this.element)
    this.onInit?.()
    return this
  }

  putAfter (element: Element) {
    element.after(this.element)
    this.onInit?.()
    return this
  }

  onRemove (unsubscribe: () => void) {
    this.destroyCallbacks.push(unsubscribe)
  }

  remove () {
    this.element.remove()

    for (const callback of this.destroyCallbacks) {
      callback()
    }
    this.destroyCallbacks.length = 0

    for (const component of this.childComponents) {
      component.remove()
    }

    this.parentComponent?.childComponents.delete(this)
    this.parentComponent = undefined
  }

  onInit? (): void

  on<T> (event: Observable<T>, listener: (data: T) => void) {
    this.onRemove(event.on(listener))
  }
}