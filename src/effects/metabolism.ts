import Effect from './Effect'
import { noisy } from '../util'
import { serializable } from '../serialize'
import { transferEnergyTo } from '../behavior/energy'
import { getWorld } from '../behavior/general'

export default class Metabolism extends Effect {
  override onActivate () {
    this.run()
  }

  override run () {
    transferEnergyTo(getWorld(), this.object, 1)
    this.runIn(noisy(1))
  }
}
serializable(Metabolism)