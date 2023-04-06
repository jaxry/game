import GameObject from '../GameObject'
import type GameObjectType from '../GameObjectType'
import { putInsideContainer } from './container'
import Point from '../Point'

export function spawn (type: GameObjectType, container?: GameObject) {
  const object = new GameObject(type)

  object.position = new Point()

  if (type.health) {
    object.health = type.health
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