import Effect from '../effects/Effect'
import { makeType } from '../GameObjectType'
import { takeEnergyFromWorld } from '../behavior/energy'
import { noisy } from '../util'
import { serializable } from '../serialize'

class Photosynthesis extends Effect {
  override onActivate () {
    this.run()
  }

  override run () {
    if (this.object.energy >= 128) {
      return
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
})