import CustomEvent from '../../CustomEvent'

type Constructor<T> = { new (...args: any[]): T }

export default class Component {
  element: HTMLElement | SVGGElement

  private parentComponent?: Component
  private childComponents = new Set<Component>()
  private destroyCallbacks: Array<() => void> = []

  constructor (element: HTMLElement | SVGGElement = document.createElement(
      'div')) {
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
    }

    for (const callback of this.destroyCallbacks) {
      callback()
    }

    for (const component of this.childComponents) {
      component.remove()
    }
  }

  on<T> (event: CustomEvent<T>, listener: (data: T) => void) {
    this.onRemove(event.on(listener))
  }
}