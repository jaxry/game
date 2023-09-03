import type Effect from './effects/Effect'
import { Permutation } from './symmetricGroup'

export default class GameObjectType {
  name: string

  description: string

  effects: Array<typeof Effect>

  energy: number

  isContainer: boolean

  composedOf: [GameObjectType, number][]

  element: Permutation
}

const typeToId = new Map<GameObjectType, number>()
const idToType = new Map<number, GameObjectType>()
let nextId = 1

const elementToType = new Map<Permutation, GameObjectType>()

export function makeType (template: Partial<GameObjectType>) {
  const type = Object.assign(new GameObjectType(), template)

  const id = nextId++
  typeToId.set(type, id)
  idToType.set(id, type)

  if (type.element) {
    elementToType.set(type.element, type)
  }

  return type
}

export function getIdFromType (type: GameObjectType) {
  return typeToId.get(type)!
}

export function getTypeFromId (id: number) {
  return idToType.get(id)!
}