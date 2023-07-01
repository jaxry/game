import Action from './Action'
import GameTime from '../GameTime'
import GameObject from '../GameObject'
import { serializable } from '../serialize'

export default class Eat extends Action {
  static override duration = 3 * GameTime.second

  constructor (object: GameObject, public override target: GameObject) {
    super(object)
  }

  override get name () {
    return ['Eat', this.target]
  }

  override condition () {
    return this.target.energy !== undefined && this.target !== this.object
  }
}
serializable(Eat)