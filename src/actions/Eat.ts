import Action from './Action'
import GameObject from '../GameObject'
import { serializable } from '../serialize'
import { destroy } from '../behavior/destroy'

export default class Eat extends Action {
  static override duration = 3

  constructor (object: GameObject, public override target: GameObject) {
    super(object)
  }

  override get name () {
    return ['Eat', this.target]
  }

  override condition () {
    return this.target.energy !== undefined && this.target !== this.object
  }

  override do () {
    this.object.energy += this.target.energy
    this.target.energy = 0
    destroy(this.target)
  }
}
serializable(Eat)