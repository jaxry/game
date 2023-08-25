import { serializable } from '../serialize'
import { destroy } from '../behavior/destroy'
import TargetAction from './TargetAction'

export default class Eat extends TargetAction {
  static override duration = 3

  override get name () {
    return ['Eat', this.target]
  }

  override condition () {
    return super.condition() && this.target.energy > 0
  }

  override do () {
    this.object.energy += this.target.energy
    this.target.energy = 0
    destroy(this.target)
  }
}
serializable(Eat)