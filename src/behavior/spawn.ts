import GameObject from '../GameObject'
import type GameObjectType from '../GameObjectType'
import { putInsideContainer } from './container'
import Position from '../Position'

export function spawn (type: GameObjectType, container?: GameObject) {
  const object = new GameObject(type)

  object.position = new Position(
      200 * (Math.random() - 0.5), 200 * (Math.random() - 0.5))

  if (type.health) {
    object.health = type.health
  }

  if (type.isContainer) {
    object.contains = new Set()
  }

  if (container) {
    putInsideContainer(container, object)
  }

  if (type.effects) {
    for (const EffectConstructor of type.effects) {
      new EffectConstructor(object).activate()
    }
  }

  return object
}