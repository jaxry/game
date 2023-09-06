import type GameObject from '../GameObject'
import { removeConnections } from './connections'
import { children, removeFromContainer } from './container'
import { removeEffects } from '../effects/Effect'
import { transferEnergyTo } from './energy'
import { getWorld } from './general'

export function destroy (obj: GameObject) {
  removeFromContainer(obj)
  removeConnections(obj)
  removeEffects(obj)

  transferEnergyTo(getWorld(), obj)

  obj.emit('leave')

  for (const child of children(obj)) {
    destroy(child)
  }
}
