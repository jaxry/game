import type { Effect } from './behavior/Effect'

export class GameObjectType {
  name: string

  icon: string

  properNoun: boolean

  description: string

  effects: Array<typeof Effect>

  isContainer: boolean

  health: number
  energy: number
}

export function makeType (template: Partial<GameObjectType>) {
  return Object.assign(new GameObjectType(), template)
}