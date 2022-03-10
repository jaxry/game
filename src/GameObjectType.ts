import type { Action } from './behavior/Action'
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

  container: GameObject & Required<Pick<GameObjectProps, `contains`>>
  containedAs: ContainedAs
  contains: GameObject[]

  spot: number

  // connections to other game objects on a 2D planar graph
  connections: GameObject[]
  position: { x: number, y: number }

  health: number
  energy: number
}

// export interface ObjectEvents {
//   destroy: undefined,
//   actionStart: { action: Action }
//   actionEnd: { action: Action }
//   receive: { receiving: GameObject, from?: GameObject },
//   move: { to: GameObject, from?: GameObject }
// }

export interface ObjectEvents {
  destroy: undefined,
  actionStart: { action: Action }
  actionEnd: { action: Action }
  receive: { receiving: GameObject, from?: GameObject },
  move: { to: GameObject, from?: GameObject }
}


export enum ContainedAs {
  inside,
  wearing
}

export type ObjectEvent = keyof ObjectEvents

export interface ObjectEventCallback<T extends ObjectEvent> {
  (object: GameObject, data: ObjectEvents[T]): void
}
