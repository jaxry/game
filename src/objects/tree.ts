import Effect from '../effects/Effect'
import { makeType } from '../GameObjectType'
import { transferEnergyTo } from '../behavior/energy'
import { noisy } from '../util'
import { serializable } from '../serialize'
import { typeWood } from './wood'
import { getWorld } from '../behavior/general'

class Photosynthesis extends Effect {
  override onActivate () {
    this.run()
  }

  override run () {
    if (this.object.energy >= 64) {
      return this.deactivate()
    }

    transferEnergyTo(this.object, getWorld(), 1)

    this.runIn(noisy(4))
  }
}

serializable(Photosynthesis)

export const typeTree = makeType({
  name: 'tree',
  effects: [Photosynthesis],
  composedOf: [typeWood, typeWood],
})