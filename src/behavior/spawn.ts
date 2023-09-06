import GameObject from '../GameObject'
import type GameObjectType from '../GameObjectType'
import { putInsideContainer } from './container'

export function spawn (type: GameObjectType, container?: GameObject) {
  const object = new GameObject(type)

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