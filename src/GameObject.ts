import type {
  GameObjectProps,
  GameObjectType,
  ObjectEvent,
  ObjectEventCallback,
  ObjectEvents,
} from './GameObjectType'
import { deleteElem } from './util'

export type GameObject = GameObjectInstance & GameObjectProps

export function makeType(type: Partial<GameObjectType>) {
  return type as GameObjectType
}

export function makeGameObject(type: GameObjectType) {
  return new GameObjectInstance(type) as GameObject
}

export interface ActiveObjectEvent {
  obj: GameObject,
  listeners: ObjectEventCallback<any>[],
  listener: ObjectEventCallback<any>
}

export function unsubscribeEvent(ev: ActiveObjectEvent) {
  deleteElem(ev.listeners, ev.listener)
}

export function isGameObject(object: any): object is GameObject {
  return object instanceof GameObjectInstance
}

let nextId = 1

class GameObjectInstance {
  type: GameObjectType
  id = nextId++

  events?: {
    [T in ObjectEvent]?: ObjectEventCallback<T>[]
  }

  constructor(type: GameObjectType) {
    this.type = type
  }

  on<T extends ObjectEvent>(
      event: T, listener: ObjectEventCallback<T>): ActiveObjectEvent {
    if (!this.events) {
      this.events = {}
    }
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event]!.push(listener as any)

    return {
      obj: this as any,
      listeners: this.events[event]!,
      listener,
    }
  }

  emit<T extends keyof ObjectEvents>(event: T, data: ObjectEvents[T]) {
    let listeners: any

    // listeners = this.type.events?.[event]
    // if (listeners) {
    //   for (const listener of listeners) {
    //     listener(this data)
    //   }
    // }

    listeners = this.events?.[event]
    if (listeners) {
      for (const listener of listeners) {
        listener(this, data)
      }
    }
  }
}
