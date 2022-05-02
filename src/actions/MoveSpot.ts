import type { GameObject } from '../GameObject'
import Action from '../behavior/Action'
import { moveToSpot } from '../behavior/container'

export default class MoveSpotAction extends Action {
  to: number

  constructor(object: GameObject, to: number) {
    super(object)
    this.to = this.object.spot + Math.sign(to - this.object.spot)
    this.time = 3
  }

  private direction() {
    if (this.to < this.object.spot) return '⬅'
    if (this.to > this.object.spot) return '➡'
    return ''
  }

  override get name() {
    return `move ${this.direction()}`
  }

  override get icon() {
    return `👣${this.direction()}`
  }

  do() {
    moveToSpot(this.object, this.to)
  }

}