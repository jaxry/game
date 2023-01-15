import Observer from '../../Observer'
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
      constructor: T,
      ...args: ConstructorParameters<T>): InstanceType<T> {

    const component = new constructor(...args)
    component.parentComponent = this

    this.childComponents.add(component)

    return component as InstanceType<T>
  }

  onRemove (unsubscribe: () => void) {
    this.destroyCallbacks.push(unsubscribe)
  }

  remove () {
    this.element.remove()

    if (this.parentComponent) {
      this.parentComponent.childComponents.delete(this)
      this.parentComponent = undefined
    } else {
      return
    }

    for (const callback of this.destroyCallbacks) {
      callback()
    }

    for (const component of this.childComponents) {
      component.remove()
    }
  }

  on<T> (event: Observer<T>, listener: (data: T) => void) {
    this.onRemove(event.on(listener))
  }
}