import Effect from './Effect'
import { destroy } from '../behavior/destroy'
import { noisy } from '../util'
import { game } from '../Game'
import { serializable } from '../serialize'

export default class Metabolism extends Effect {
  override onActivate () {
    this.run()
  }

  override run () {
    if (!this.object.energy || this.object.energy <= 0) {
      return destroy(this.object)
    }

    this.object.energy--
    game.energyPool++
    this.runIn(noisy(1))
  }
}
serializable(Metabolism)