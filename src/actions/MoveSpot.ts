import type GameObject from '../GameObject'
import Action from '../behavior/Action'
import { moveToSpot } from '../behavior/container'
import { serializable } from '../serialize'
import GameTime from '../GameTime'

export default class MoveSpotAction extends Action {
  override time = 3 * GameTime.second

  constructor (object: GameObject, public to: number) {
    super(object)
  }

  override get name () {
    return `move ${this.direction()}`
  }

  override get icon () {
    return `👣${this.direction()}`
  }

  override onActivate () {
    this.to = this.object.spot + Math.sign(this.to - this.object.spot)
  }

  override do () {
    moveToSpot(this.object, this.to)
  }

  private direction () {
    if (this.to < this.object.spot) return '⬅'
    if (this.to > this.object.spot) return '➡'
    return ''
  }
}
serializable(MoveSpotAction)