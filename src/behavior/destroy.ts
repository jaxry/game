import type GameObject from '../GameObject'
import { removeConnections } from './connections'
import { children, removeFromContainer } from './container'
import { removeEffects } from '../effects/Effect'
import { giveEnergyToWorld } from './energy'

export function destroy (obj: GameObject) {
  removeFromContainer(obj)
  removeConnections(obj)
  removeEffects(obj)

  giveEnergyToWorld(obj.energy)

  obj.emit('leave')

  for (const child of children(obj)) {
    destroy(child)
  }
}
