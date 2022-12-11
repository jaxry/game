import type {
  GameObjectEvent, GameObjectEventListener, GameObjectEvents, GameObjectProps,
  GameObjectType,
} from './GameObjectType'

export type GameObject = GameObjectInstance & GameObjectProps

export function makeType (type: Partial<GameObjectType>) {
  return type as GameObjectType
}

export function makeGameObject (type: GameObjectType) {
  return new GameObjectInstance(type) as GameObject
}

export interface ActiveGameObjectEvent {
  obj: GameObject
  listeners: Set<GameObjectEventListener<any>>
  listener: GameObjectEventListener<any>
}

export function unsubscribeEvent (ev: ActiveGameObjectEvent) {
  ev.listeners.delete(ev.listener)
}

let nextId = 1

class GameObjectInstance {
  type: GameObjectType
  id = nextId++

  private events?: {
    [T in GameObjectEvent]?: Set<GameObjectEventListener<T>>
  }

  constructor (type: GameObjectType) {
    this.type = type
  }

  on<T extends GameObjectEvent> (
      event: T, listener: GameObjectEventListener<T>): ActiveGameObjectEvent {
    if (!this.events) {
      this.events = {}
    }
    if (!this.events[event]) {
      this.events[event] = new Set() as any
    }
    this.events[event]!.add(listener as any)

    return {
      obj: this as any,
      listeners: this.events[event]!,
      listener,
    }
  }

  emit<T extends keyof GameObjectEvents> (event: T, data: GameObjectEvents[T]) {
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
