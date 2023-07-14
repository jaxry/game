import { Constructor } from '../types'
import Observable from '../Observable'
import Stage from './Stage'

export default class Component {
  parentComponent?: Component
  childComponents?: Set<Component>
  stage: Stage
  hitColor: string

  events = new Events()

  private onRemoveCallbacks: (() => void)[] = []

  newComponent<T extends Constructor<Component>> (
      constructor: T, ...args: ConstructorParameters<T>) {

    const component = new constructor(...args)
    component.parentComponent = this
    initComponent(component, this.stage)

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
  }

  onClick (callback: () => boolean | void) {
    addEventListener(this.events, 'clickObserver', callback)
  }

  onPointerEnter (callback: () => boolean | void) {
    addEventListener(this.events, 'pointerEnterObserver', callback)
  }

  onPointerOut (callback: () => boolean | void) {
    addEventListener(this.events, 'pointerOutObserver', callback)
  }

  onRemove (unsubscribe: () => void) {
    this.onRemoveCallbacks.push(unsubscribe)
  }

  draw () {
    this.onDraw?.(this.stage.ctx)
    if (this.hitbox) {
      this.stage.hitCtx.fillStyle = this.hitColor!
      this.hitbox?.(this.stage.hitCtx)
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
  clickObserver?: Observable<PointerEvent>
  pointerEnterObserver?: Observable<PointerEvent>
  pointerOutObserver?: Observable<PointerEvent>
}

function addEventListener (
    events: Events, name: keyof Events,
    callback: (e: PointerEvent) => boolean | void) {
  if (!events[name]) {
    events[name] = new Observable()
  }
  events[name]!.on(callback)
}

export function initComponent (component: Component, stage: Stage) {
  component.stage = stage
  stage.registerComponent(component)
  component.init?.()
}


