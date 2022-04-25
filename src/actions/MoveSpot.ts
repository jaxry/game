import type { GameObject } from '../GameObject'
import Action from '../behavior/Action'
import { moveToSpot } from '../behavior/container'

const timePerSpot = 3

export default class MoveSpotAction extends Action {

  constructor(object: GameObject, public to: number) {
    super(object)
    this.time = timePerSpot * Math.abs(this.to - this.object.spot)
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