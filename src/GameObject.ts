import type GameObjectType from './GameObjectType'
import { getIdFromType, getTypeFromId } from './GameObjectType'
import Effect from './effects/Effect'
import Action from './actions/Action'
import { serializable } from './serialize'
import { toPrecision } from './util'
import Point from './Point'

let nextId = 1

export default class GameObject {
  id = nextId++

  type: GameObjectType

  effects: Set<Effect>
  activeAction: Action

  container: GameObject
  containedAs: ContainedAs
  contains: Set<GameObject>

  // connections to other game objects on a 2D planar graph
  connections: GameObject[]
  position: Point

  energy: number

  events?: {
    [T in GameObjectEvent]?: Set<GameObjectEventListener<T>>
  }
  childEvents?: {
    [T in GameObjectEvent]?: Set<GameObjectChildEventListener<T>>
  }

  constructor (type: GameObjectType) {
    this.type = type
  }

  on<T extends GameObjectEvent> (
      event: T, listener: GameObjectEventListener<T>): ActiveGameObjectEvent {
    if (!this.events) {
      this.events = new GameObjectEvents() as {}
    }
    if (!this.events[event]) {
      this.events[event] = new Set() as any
    }
    this.events[event]!.add(listener as any)

    return new ActiveGameObjectEvent(this.events[event]!, listener)
  }

  onChildren<T extends GameObjectEvent> (
      event: T,
      listener: GameObjectChildEventListener<T>): ActiveGameObjectEvent {
    if (!this.childEvents) {
      this.childEvents = new GameObjectEvents() as {}
    }
    if (!this.childEvents[event]) {
      this.childEvents[event] = new Set() as any
    }
    this.childEvents[event]!.add(listener as any)

    return new ActiveGameObjectEvent(this.childEvents[event]!, listener)
  }

  emit<T extends keyof GameObjectEvents> (
      event: T, ...data: GameObjectEvents[T]) {
    const listeners = this.events?.[event]
    if (listeners) {
      for (const listener of listeners) {
        listener(...data)
      }
    }
    const childListeners = this.container?.childEvents?.[event]
    if (childListeners) {
      for (const listener of childListeners) {
        listener(this, ...data)
      }
    }
  }
}

export class GameObjectEvents {
  // objects being contained or taken out of the event object
  enter: [from?: GameObject]
  leave: [to?: GameObject]

  // actions starting/finishing on a contained object of the event object
  actionStart: [action: Action]
  actionEnd: [action: Action]

  speak: [message: string]
}

export enum ContainedAs {
  inside,
  wearing
}

export type GameObjectEvent = keyof GameObjectEvents

export interface GameObjectEventListener<T extends GameObjectEvent> {
  (...args: GameObjectEvents[T]): void
}

export interface GameObjectChildEventListener<T extends GameObjectEvent> {
  (object: GameObject, ...args: GameObjectEvents[T]): void
}

export class ActiveGameObjectEvent {
  constructor (
      public listeners: Set<any>,
      public listener: any) {
  }

  unsubscribe () {
    this.listeners.delete(this.listener)
  }
}

serializable(GameObject, {
  transform: {
    id: serializable.ignore,
    events: serializable.ignore,
    childEvents: serializable.ignore,
    container: serializable.ignore, // added back in Game class
    type: [
      (type: GameObjectType) => getIdFromType(type),
      (id: number) => getTypeFromId(id),
    ],
    position: [
      (position: Point) => ({
        x: toPrecision(position.x, 0),
        y: toPrecision(position.y, 0),
      }),
      ({ x, y }: any) => new Point(x, y)],
  },
})

