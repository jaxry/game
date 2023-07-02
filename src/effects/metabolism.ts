import Effect from './Effect'
import { destroy } from '../behavior/destroy'
import { randomCentered } from '../util'
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

    this.runIn(1 * (1 + randomCentered()))
  }
}
serializable(Metabolism)