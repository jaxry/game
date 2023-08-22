import type GameObject from '../GameObject'
import { removeConnections } from './connections'
import { children, removeFromContainer } from './container'
import { removeEffects } from '../effects/Effect'
import { game } from '../Game'

export function destroy (obj: GameObject) {
  removeFromContainer(obj)
  removeConnections(obj)
  removeEffects(obj)

  game.energyPool += obj.energy

  obj.emit('leave')

  for (const child of children(obj)) {
    destroy(child)
  }
}
