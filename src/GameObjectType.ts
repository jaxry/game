import type Effect from './effects/Effect'

export default class GameObjectType {
  name: string

  description: string

  effects: Array<typeof Effect>

  isContainer: boolean

  energy: number
}

const typeToId = new Map<GameObjectType, number>()
const idToType = new Map<number, GameObjectType>()
let nextId = 1

export function makeType (template: Partial<GameObjectType>) {
  const id = nextId++
  const type = new GameObjectType()
  typeToId.set(type, id)
  idToType.set(id, type)
  return Object.assign(type, template)
}

export function getIdFromType (type: GameObjectType) {
  return typeToId.get(type)!
}

export function getTypeFromId (id: number) {
  return idToType.get(id)!
}