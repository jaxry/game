import type GameObject from '../GameObject'
import { removeConnections } from './connections'
import { removeFromContainer } from './container'
import { removeEffects } from '../effects/Effect'
import { game } from '../Game'

export function destroy (obj: GameObject) {
  removeFromContainer(obj)
  removeConnections(obj)
  removeEffects(obj)

  game.energyPool += obj.energy

  obj.emit('leave')

  if (obj.contains) {
    for (const item of obj.contains) {
      destroy(item)
    }
  }
}
