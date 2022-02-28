import type { GameObject } from '../GameObject'
import { Action } from '../behavior/Action'

const timePerSpot = 2

export default class MoveSpotAction extends Action {
  static override effectName = 'move to spot'

  constructor(object: GameObject, public to: number) {
    super(object)
    this.time = timePerSpot * Math.abs(this.to - this.object.spot)
  }

  override actionTick() {
    if (this.time % timePerSpot === 0) {
      this.object.spot += Math.sign(this.to - this.object.spot)
    }
  }
}