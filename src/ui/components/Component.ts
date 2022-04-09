import { deleteElem } from '../../util'
import CustomEvent from '../../CustomEvent'
import { Effect } from '../../behavior/Effect'

type Constructor<T> = {new (...args: any[]): T}

export default class Component {
  element: HTMLElement

  private childComponents: Component[] = []
  private destroyCallbacks: Array<() => void> = []

  constructor(element: HTMLElement = document.createElement('div')) {
    this.element = element
  }

  newComponent<T extends Constructor<Component>>(
      constructor: T,
      ...args: ConstructorParameters<T>): InstanceType<T> {
    const component = new constructor(...args)
    this.childComponents.push(component)
    return component as InstanceType<T>
  }

  removeComponent(component: Component) {
    deleteElem(this.childComponents, component)
    component.element.remove()
    component.destroy()
  }

  register(unsubscribe: () => void) {
    this.destroyCallbacks.push(unsubscribe)
  }

  destroy() {
    this.element.remove()
    for (const component of this.childComponents) {
      component.destroy()
    }
    for (const callback of this.destroyCallbacks) {
      callback()
    }
  }

  on<T>(event: CustomEvent<T>, listener: (data: T) => void) {
    this.register(event.on(listener))
  }

  newEffect<T extends Constructor<Effect>>(
      constructor: T,
      ...args: ConstructorParameters<T>) {

    const effect = new constructor(...args).activate()!
    this.register(() => {
      effect.deactivate()
    })
  }
}