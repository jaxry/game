import Observable from '../../Observable'
import { Constructor } from '../../types'

export default class Component<T extends Element = HTMLElement> {
  element: T

  private parentComponent?: Component<Element>
  private childComponents = new Set<Component<Element>>()
  private destroyCallbacks: Array<() => void> = []

  constructor (element: T = document.createElement('div') as any) {
    this.element = element
  }

  newComponent<T extends Constructor<Component>> (
      parent: Element | null,
      constructor: T,
      ...args: ConstructorParameters<T>): InstanceType<T> {

    const component = new constructor(...args)
    component.parentComponent = this

    this.childComponents.add(component)

    if (parent) {
      parent.append(component.element)
    }

    return component as InstanceType<T>
  }

  onRemove (unsubscribe: () => void) {
    this.destroyCallbacks.push(unsubscribe)
  }

  remove () {
    this.element.remove()

    this.parentComponent?.childComponents.delete(this)
    this.parentComponent = undefined

    for (const callback of this.destroyCallbacks) {
      callback()
    }
    this.destroyCallbacks.length = 0

    for (const component of this.childComponents) {
      component.remove()
    }
    this.childComponents.clear()
  }

  on<T> (event: Observable<T>, listener: (data: T) => void) {
    this.onRemove(event.on(listener))
  }

  getContext<T> (context: Context<T>): T {
    let component: Component<any> | undefined = this
    while (component) {
      const value = context.map.get(component)
      if (value) {
        return value
      }
      component = component.parentComponent
    }
    return context.defaultValue
  }

  setContext<T> (context: Context<T>, value: T) {
    context.map.set(this, value)
  }
}

export class Context<T> {
  map = new WeakMap<any, T>()

  constructor (public defaultValue: T) {

  }
}