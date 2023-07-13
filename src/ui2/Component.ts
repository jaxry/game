import { Constructor } from '../types'
import Observable from '../Observable'
import Stage from './Stage'

export default class Component {
  parentComponent?: Component
  childComponents?: Set<Component>
  stage: Stage
  hitColor: string

  clickObserver: Observable<void>
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
    if (!this.clickObserver) {
      this.clickObserver = new Observable()
    }
    this.clickObserver.on(callback)
  }

  onRemove (unsubscribe: () => void) {
    this.onRemoveCallbacks.push(unsubscribe)
  }

  on<T> (event: Observable<T>, listener: (data: T) => void) {
    this.onRemove(event.on(listener))
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

export function initComponent (component: Component, stage: Stage) {
  component.stage = stage
  stage.registerComponent(component)
  component.init?.()
}