import type {
  GameObjectProps,
  GameObjectType,
  GameObjectEvent,
  GameObjectEventCallback,
  GameObjectEvents,
} from './GameObjectType'
import { deleteElem } from './util'

export type GameObject = GameObjectInstance & GameObjectProps

export function makeType(type: Partial<GameObjectType>) {
  return type as GameObjectType
}

export function makeGameObject(type: GameObjectType) {
  return new GameObjectInstance(type) as GameObject
}

export interface ActiveGameObjectEvent {
  obj: GameObject,
  listeners: GameObjectEventCallback<any>[],
  listener: GameObjectEventCallback<any>
}

export function unsubscribeEvent(ev: ActiveGameObjectEvent) {
  deleteElem(ev.listeners, ev.listener)
}

let nextId = 1

class GameObjectInstance {
  type: GameObjectType
  id = nextId++

  events?: {
    [T in GameObjectEvent]?: GameObjectEventCallback<T>[]
  }

  constructor(type: GameObjectType) {
    this.type = type
  }

  on<T extends GameObjectEvent>(
      event: T, listener: GameObjectEventCallback<T>): ActiveGameObjectEvent {
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

  emit<T extends keyof GameObjectEvents>(event: T, data: GameObjectEvents[T]) {
    let listeners: any

    // listeners = this.type.events?.[event]
    // if (listeners) {
    //   for (const listener of listeners) {
    //     listener(data)
    //   }
    // }

    listeners = this.events?.[event]
    if (listeners) {
      for (const listener of listeners) {
        listener(data)
      }
    }

  }
}
