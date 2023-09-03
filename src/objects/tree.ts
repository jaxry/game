import Effect from '../effects/Effect'
import { makeType } from '../GameObjectType'
import { takeEnergyFromWorld } from '../behavior/energy'
import { noisy } from '../util'
import { serializable } from '../serialize'
import { typeWood } from './wood'

class Photosynthesis extends Effect {
  override onActivate () {
    this.run()
  }

  override run () {
    if (this.object.energy >= 64) {
      return this.deactivate()
    }

    this.object.energy += takeEnergyFromWorld(1)

    this.runIn(noisy(4))
  }
}

serializable(Photosynthesis)

export const typeTree = makeType({
  name: 'tree',
  energy: 1,
  effects: [Photosynthesis],
  composedOf: [[typeWood, 2]],
})