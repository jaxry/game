import { Constructor } from '../types'
import Observable from '../Observable'
import Stage from './Stage'

export default class Component {
  parentComponent?: Component
  childComponents?: Set<Component>
  stage: Stage

  hitId: number
  hitColor: string

  events = new Events()

  private onRemoveCallbacks: (() => void)[] = []

  newComponent<T extends Constructor<Component>> (
      constructor: T, ...args: ConstructorParameters<T>) {

    const component = new constructor(...args)
    component.parentComponent = this
    addComponentToStage(component, this.stage)

    if (!this.childComponents) {
      this.childComponents = new Set()
    }
    this.childComponents.add(component)

    return component as InstanceType<T>
  }

  remove () {
    this.parentComponent?.childComponents!.delete(this)
    this.parentComponent = undefined

    for (const callback of this.onRemoveCallbacks) {
      callback()
    }
    this.onRemoveCallbacks.length = 0

    if (this.childComponents) {
      for (const component of this.childComponents) {
        component.remove()
      }
      this.childComponents.clear()
    }

    if (this.hitId) {
      this.stage.removeComponentId(this)
    }
  }

  addEventListener (
      name: keyof Events, callback: (e: PointerEvent) => boolean | void) {
    if (!this.hitColor) {
      this.stage.setComponentId(this)
    }
    if (!this.events[name]) {
      this.events[name] = new Observable()
    }
    this.events[name]!.on(callback)
  }

  onRemove (unsubscribe: () => void) {
    this.onRemoveCallbacks.push(unsubscribe)
  }

  draw () {
    this.onDraw?.(this.stage.ctx)
    if (this.hitId && this.hitbox) {
      this.stage.hitCtx.fillStyle = this.hitColor
      this.hitbox(this.stage.hitCtx)
    }
    if (this.childComponents) {
      for (const component of this.childComponents) {
        component.draw()
      }
    }
  }

  init? (): void

  onDraw? (ctx: CanvasRenderingContext2D): void

  hitbox? (ctx: CanvasRenderingContext2D): void
}

interface PointerEvent {

}

export class Events {
  click?: Observable<PointerEvent>
  pointerenter?: Observable<PointerEvent>
  pointerout?: Observable<PointerEvent>
  pointerdown?: Observable<PointerEvent>
  pointerup?: Observable<PointerEvent>
}

export function addComponentToStage (component: Component, stage: Stage) {
  component.stage = stage
  component.init?.()
}


