import { Constructor } from '../../types'
import Observable from '../../Observable'
import Stage from '../Stage'
import { Canvas } from 'canvaskit-wasm'

export default class Component {
  parentComponent: Component
  childComponents = new Set<Component>()

  stage: Stage

  events: Record<string, Observable<any>> = {}

  private onRemoveCallbacks: (() => void)[] = []

  init (stage: Stage) {
    this.stage = stage
    this.onInit?.()
  }

  newComponent<T extends Component> (
      constructor: Constructor<T>,
      ...args: ConstructorParameters<Constructor<T>>) {

    const component = new constructor(...args)
    component.parentComponent = this

    this.childComponents.add(component)

    component.init(this.stage)

    return component
  }

  remove () {
    this.parentComponent.childComponents!.delete(this)

    for (const callback of this.onRemoveCallbacks) {
      callback()
    }
    this.onRemoveCallbacks.length = 0

    for (const component of this.childComponents) {
      component.remove()
    }
    this.childComponents.clear()
  }

  onRemove (unsubscribe: () => void) {
    this.onRemoveCallbacks.push(unsubscribe)
  }

  new<T extends { delete (): any }> (constructor: Constructor<T>): T {
    const instance = new constructor()
    this.onRemove(() => instance.delete())
    return instance
  }

  make<T extends (...args: any) => { delete (): any }> (
      factory: T, ...args: Parameters<T>): ReturnType<T> {
    const instance = factory(...args as any)
    this.onRemove(() => instance.delete())
    return instance as any
  }

  addEventListener (name: string, callback: (...args: any) => void) {
    if (!this.events[name]) {
      this.events[name] = new Observable()
    }
    this.events[name].on(callback)
  }

  draw (canvas: Canvas) {
    this.onDraw?.(canvas)
    for (const component of this.childComponents) {
      component.draw(canvas)
    }
  }

  hit (x: number, y: number): Component | null {
    let hitComponent: Component | null = null

    for (const child of this.childComponents) {
      hitComponent = child.hit(x, y) || hitComponent
    }

    if (!hitComponent && this.hitArea) {
      hitComponent = this.hitArea(x, y) ? this : null
    }

    return hitComponent
  }

  onInit? (): void

  onDraw? (canvas: Canvas): void

  hitArea? (x: number, y: number): boolean
}

export interface CanvasPointerEvent {
  x: number,
  y: number,
  target: Component
}

