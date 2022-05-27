import type Action from './behavior/Action'
import type { Effect } from './behavior/Effect'
import type { GameObject } from './GameObject'

export interface GameObjectType {
  name: string,

  icon: string,

  properNoun: boolean,

  description: string,

  effects: Array<typeof Effect>

  isContainer: boolean,

  health: number,
  energy: number
}

export interface GameObjectProps {
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
  position: { x: number, y: number }

  health: number
  energy: number
}

export interface GameObjectEvents {
  destroy: undefined,

  // objects being contained or taken out of the event object
  enter: { item: GameObject, from?: GameObject },
  leave: { item: GameObject, to?: GameObject },
  moveSpot: { item: GameObject, from: number, to: number },

  // actions starting/finishing on a contained object of the event object
  itemActionStart: { action: Action },
  itemActionEnd: { action: Action },

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
