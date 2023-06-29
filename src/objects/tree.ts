import Effect from '../effects/Effect'
import { makeType } from '../GameObjectType'
import { speak } from '../behavior/speak'
import { takeEnergyFromWorld } from '../behavior/energy'
import GameTime from '../GameTime'
import { randomCentered } from '../util'
import { serializable } from '../serialize'

class Photosynthesis extends Effect {

  queue () {
    this.runIn(10 * GameTime.second * (1 + randomCentered()))
  }

  override onActivate () {
    this.queue()
  }

  override run () {
    if (this.object.energy >= 10) {
      return this.deactivate()
    }

    this.object.energy += takeEnergyFromWorld(1)
    speak(this.object, `Energy: ${this.object.energy}`)
    this.queue()
  }
}
serializable(Photosynthesis)

export const typeTree = makeType({
  name: 'tree',
  energy: 1,
  effects: [Photosynthesis],
})