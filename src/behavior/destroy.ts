import type { GameObject } from '../GameObject'
import { removeConnections } from './connections'
import { removeFromContainer } from './container'
import { removeEffects } from './Effect'

const destroyedSet: WeakSet<GameObject> = new WeakSet()

function destroy (obj: GameObject, isContainerDestroyed = false) {
  if (!isContainerDestroyed) {
    removeFromContainer(obj)
  }
  removeConnections(obj)
  removeEffects(obj)

  obj.emit('destroy', undefined)

  let reclaimedEnergy = obj.energy ?? 0

  if (obj.contains) {
    for (const item of obj.contains) {
      reclaimedEnergy += destroy(item, true)
    }
  }
  return reclaimedEnergy
}

export function markDestroy (obj: GameObject) {
  destroyedSet.add(obj)
  toDestroy.push(obj)
}

export function isDestroyed (obj: GameObject) {
  return destroyedSet.has(obj)
}

export function destroyMarked () {
  let reclaimedEnergy = 0

  for (const obj of toDestroy) {
    reclaimedEnergy += destroy(obj)
  }

  toDestroy.length = 0

  return reclaimedEnergy
}

const toDestroy: GameObject[] = []


