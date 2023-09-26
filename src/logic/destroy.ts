import type Entity from '../Entity.ts'
import { entityChildren, removeFrom } from './container'
import { removeEffects } from '../effects/Effect'

export function destroy (entity: Entity) {
  removeEffects(entity)
  removeFrom(entity)

  entityChildren(entity, destroy)
}

export function isDestroyed (entity: Entity) {
  return !entity.parent
}
