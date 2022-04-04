import { deleteElem } from '../../util'
import CustomEvent from '../../CustomEvent'
import { Effect } from '../../behavior/Effect'

type Constructor<T> = new (...args: any[]) => T

export default class Component {
  childComponents: Component[] = []
  destroyCallbacks: Array<() => void> = []

  constructor(public element: HTMLElement) {}

  newComponent<T extends Component>(
      constructor: Constructor<T>,
      ...args: ConstructorParameters<Constructor<T>>): T {
    const component = new constructor(...args)
    this.childComponents.push(component)
    return component
  }

  removeComponent(component: Component) {
    deleteElem(this.childComponents, component)
    component.element.remove()
    component.destroy()
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
    this.destroyCallbacks.push(event.on(listener))
  }

  newEffect<T extends Effect>(
      constructor: Constructor<T>,
      ...args: ConstructorParameters<Constructor<T>>) {
    const effect = new constructor(...args).activate()!
    this.destroyCallbacks.push(() => {
      effect.deactivate()
    })
  }
}