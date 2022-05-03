import { deleteElem } from '../../util'
import CustomEvent from '../../CustomEvent'
import { Effect } from '../../behavior/Effect'

type Constructor<T> = {new (...args: any[]): T}

export default class Component {
  element: HTMLElement

  private parentComponent?: Component
  private childComponents: Component[] = []
  private destroyCallbacks: Array<() => void> = []

  constructor(element: HTMLElement = document.createElement('div')) {
    this.element = element
  }

  newComponent<T extends Constructor<Component>>(
      constructor: T,
      ...args: ConstructorParameters<T>): InstanceType<T> {

    const component = new constructor(...args)
    component.parentComponent = this
    this.childComponents.push(component)
    return component as InstanceType<T>
  }

  onRemove(unsubscribe: () => void) {
    this.destroyCallbacks.push(unsubscribe)
  }

  remove() {
    this.element.remove()

    if (this.parentComponent) {
      deleteElem(this.parentComponent.childComponents, this)
    }

    for (const callback of this.destroyCallbacks) {
      callback()
    }

    for (const component of this.childComponents) {
      component.remove()
    }
  }

  on<T>(event: CustomEvent<T>, listener: (data: T) => void) {
    this.onRemove(event.on(listener))
  }

  newEffect<T extends Constructor<Effect>>(
      constructor: T,
      ...args: ConstructorParameters<T>) {

    const effect = new constructor(...args).activate()!
    this.onRemove(() => {
      effect.deactivate()
    })
  }
}