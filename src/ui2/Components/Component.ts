import { Constructor } from '../../types'
import Observable from '../../Observable'
import Stage from '../Stage'
import { Canvas } from 'canvaskit-wasm'

export default class Component {
  parentComponent: Component
  childComponents?: Set<Component>

  stage: Stage

  events: Record<string, Observable<any>> = {}

  private onRemoveCallbacks: (() => void)[] = []

  init (stage: Stage) {
    this.stage = stage
    this.onInit?.()
  }

  newComponent<T extends Constructor<Component>> (
      constructor: T, ...args: ConstructorParameters<T>) {

    const component = new constructor(...args)
    component.parentComponent = this

    if (!this.childComponents) {
      this.childComponents = new Set()
    }
    this.childComponents.add(component)

    component.init(this.stage)

    return component as InstanceType<T>
  }

  remove () {
    this.parentComponent.childComponents!.delete(this)

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

  onRemove (unsubscribe: () => void) {
    this.onRemoveCallbacks.push(unsubscribe)
  }

  addEventListener (name: any, callback: (...args: any) => void) {
    if (!this.events[name]) {
      this.events[name] = new Observable()
    }
    this.events[name].on(callback)
  }

  draw (canvas: Canvas) {
    this.onDraw?.(canvas)
    if (this.childComponents) {
      for (const component of this.childComponents) {
        component.draw(canvas)
      }
    }
  }

  onInit? (): void

  onDraw? (canvas: Canvas): void

  hitbox? (): void
}

export interface CanvasPointerEvent {
  x: number,
  y: number,
  target: Component
}

