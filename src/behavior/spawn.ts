import GameObject from '../GameObject'
import type GameObjectType from '../GameObjectType'
import { putInsideContainer } from './container'

export function spawn (type: GameObjectType, container?: GameObject) {
  const instance = new GameObject(type)

  if (type.health) {
    instance.health = type.health
  }

  if (type.isContainer) {
    instance.contains = new Set()
  }

  if (container) {
    putInsideContainer(container, instance)
  }

  if (type.effects) {
    for (const EffectConstructor of type.effects) {
      new EffectConstructor(instance).activate()
    }
  }

  return instance
}