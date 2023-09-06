import { serializable } from '../serialize'
import { destroy } from '../behavior/destroy'
import TargetAction from './TargetAction'
import { transferEnergyTo } from '../behavior/energy'

export default class Eat extends TargetAction {
  override get name () {
    return ['Eat', this.target]
  }

  override condition () {
    return super.condition() && this.target.energy > 0
  }

  override do () {
    transferEnergyTo(this.object, this.target)
    destroy(this.target)
  }
}
serializable(Eat)