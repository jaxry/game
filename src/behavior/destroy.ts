import type GameObject from '../GameObject'
import { removeConnections } from './connections'
import { removeFromContainer } from './container'
import { removeEffects } from '../effects/Effect'

const destroyedSet: WeakSet<GameObject> = new WeakSet()

export function destroy (obj: GameObject) {
  removeFromContainer(obj)
  removeConnections(obj)
  removeEffects(obj)

  obj.emit('destroy')

  if (obj.contains) {
    for (const item of obj.contains) {
      destroy(item)
    }
  }
}

export function isDestroyed (obj: GameObject) {
  return destroyedSet.has(obj)
}


