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
}
serializable(Eat)