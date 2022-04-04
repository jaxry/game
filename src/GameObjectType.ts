import type Action from './behavior/Action'
import type { Effect } from './behavior/Effect'
import type { GameObject } from './GameObject'

export interface GameObjectType {
  name: string,

  properNoun: boolean,

  description: string,

  events: {
    [T in keyof ObjectEvents]?: ObjectEventCallback<T>[]
  }

  effects: Array<typeof Effect>

  isContainer: boolean,

  health: number,
  energy: number
}

export interface GameObjectProps {
  type: GameObjectType

  effects: Effect[]
  activeAction: Action

  container: GameObject
  containedAs: ContainedAs
  contains: GameObject[]

  spot: number

  // connections to other game objects on a 2D planar graph
  connections: GameObject[]
  position: { x: number, y: number }

  health: number
  energy: number
}

export interface ObjectEvents {
  destroy: undefined,

  // objects being contained or taken out of the event object
  enter: { item: GameObject, from?: GameObject },
  leave: { item: GameObject, to?: GameObject },
  moveSpot: {item: GameObject, from: number, to: number},

  // actions starting/finishing on a contained object of the event object
  itemActionStart: { action: Action},
  itemActionFinish: { action: Action },

  // the event object put inside a new container object
  move: { to: GameObject, from?: GameObject },
}

export enum ContainedAs {
  inside,
  wearing
}

export type ObjectEvent = keyof ObjectEvents

export interface ObjectEventCallback<T extends ObjectEvent> {
  (data: ObjectEvents[T]): void
}
