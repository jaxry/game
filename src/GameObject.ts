import type {
  GameObjectEvent, GameObjectEventListener, GameObjectEvents, GameObjectProps,
  GameObjectType,
} from './GameObjectType'
import { serializable } from './serialize'

export type GameObject = GameObjectInstance & GameObjectProps

export function makeType (type: Partial<GameObjectType>) {
  return type as GameObjectType
}

export function makeGameObject (type: GameObjectType) {
  return new GameObjectInstance(type) as GameObject
}

export class ActiveGameObjectEvent {
  constructor (
      public listeners: Set<GameObjectEventListener<any>>,
      public listener: GameObjectEventListener<any>,
  ) {
  }

  unsubscribe () {
    this.listeners.delete(this.listener)
  }
}

let nextId = 1

class GameObjectInstance {
  id = nextId++

  type: GameObjectType

  events?: {
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

    return new ActiveGameObjectEvent(this.events[event]!, listener)
  }

  emit<T extends keyof GameObjectEvents> (event: T, data: GameObjectEvents[T]) {
    const listeners = this.events?.[event]
    if (listeners) {
      for (const listener of listeners) {
        listener(data)
      }
    }
  }
}

serializable(GameObjectInstance, {
  ignore: ['id', 'events'],
})
