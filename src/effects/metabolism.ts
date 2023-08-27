import Effect from './Effect'
import { noisy } from '../util'
import { serializable } from '../serialize'
import { giveEnergyToWorld, takeEnergyFromObject } from '../behavior/energy'

export default class Metabolism extends Effect {
  override onActivate () {
    this.run()
  }

  override run () {
    const expended = takeEnergyFromObject(this.object, 1)
    giveEnergyToWorld(expended)
    this.runIn(noisy(1))
  }
}
serializable(Metabolism)