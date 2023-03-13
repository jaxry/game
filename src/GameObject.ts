import type GameObjectType from './GameObjectType'
import { getIdFromType, getTypeFromId } from './GameObjectType'
import Effect from './behavior/Effect'
import Action from './behavior/Action'
import { ignore, ignoreIfEmpty, serializable } from './serialize'
import { toPrecision } from './util'
import Position from './Position'

let nextId = 1

export default class GameObject {
  id = nextId++

  type: GameObjectType

  effects: Set<Effect>
  activeAction: Action

  container: GameObject
  containedAs: ContainedAs
  contains: Set<GameObject>

  // the 1-dimensional space that the object resides in
  spot: number

  // the number of 1-dimensional spaces the container has
  numSpots: number

  // connections to other game objects on a 2D planar graph
  connections: GameObject[]
  position: Position

  health: number
  energy: number

  events?: {
    [T in GameObjectEvent]?: Set<GameObjectEventListener<T>>
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

  emit<T extends keyof GameObjectEvents> (event: T, data: GameObjectEvents[T]) {
    const listeners = this.events?.[event]
    if (listeners) {
      for (const listener of listeners) {
        listener(data)
      }
    }
  }
}

serializable(GameObject, {
  transform: {
    id: ignore,
    events: ignore,
    container: ignore, // added back in Game class
    type: [
      (type: GameObjectType) => getIdFromType(type),
      (id: number) => getTypeFromId(id),
    ],
    position: [
      (position: Position) => ({
        x: toPrecision(position.x, 0),
        y: toPrecision(position.y, 0),
      }),
      ({ x, y }: any) => new Position(x, y)],
    effects: ignoreIfEmpty,
    contains: ignoreIfEmpty,
  },
})

export class GameObjectEvents {
  destroy: void

  // objects being contained or taken out of the event object
  enter: { item: GameObject, from?: GameObject }
  leave: { item: GameObject, to?: GameObject }
  moveSpot: { item: GameObject, from: number, to: number }

  // actions starting/finishing on a contained object of the event object
  itemActionStart: { action: Action }
  itemActionEnd: { action: Action }

  // the event object put inside a new container object
  // move: { to: GameObject, from?: GameObject },
}

export enum ContainedAs {
  inside,
  wearing
}

export type GameObjectEvent = keyof GameObjectEvents

export interface GameObjectEventListener<T extends GameObjectEvent> {
  (data: GameObjectEvents[T]): void
}

export class ActiveGameObjectEvent {
  constructor (
      public listeners: Set<GameObjectEventListener<any>>,
      public listener: GameObjectEventListener<any>) {
  }

  unsubscribe () {
    this.listeners.delete(this.listener)
  }
}

