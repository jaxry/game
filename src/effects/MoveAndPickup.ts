import Effect from '../behavior/Effect'
import type GameObject from '../GameObject'
import MoveSpotAction from '../actions/MoveSpot'
import TransferAction from '../actions/Transfer'
import { serializable } from '../serialize'

export default class MoveAndPickup extends Effect {
  constructor (object: GameObject, public target: GameObject) {
    super(object)
  }

  moveOrPickup () {
    if (this.target.spot === this.object.spot) {
      new TransferAction(this.object, this.target, this.object).activate()
      this.deactivate()
    } else {
      new MoveSpotAction(this.object, this.target.spot).activate()
    }
  }

  override tick () {
    if (!this.object.activeAction) {
      this.moveOrPickup()
    }
  }
}
serializable(MoveAndPickup)