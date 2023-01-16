import Action from '../behavior/Action'
import type GameObject from '../GameObject'
import { isAncestor, putInsideContainer } from '../behavior/container'
import { serializable } from '../serialize'
import GameTime from '../GameTime'

export default class TransferAction extends Action {
  override time = 5 * GameTime.second

  constructor (
      object: GameObject, override target: GameObject,
      public destination: GameObject, public spot?: number) {
    super(object)
  }

  override get name () {
    return `pick up`
  }

  override get nameActive () {
    return `picking up`
  }

  override condition () {
    // moving to a different spot
    return this.target.container !== this.destination &&

        // not moving target to an item it contains
        !isAncestor(this.target, this.destination) &&

        // object in same room as target
        isAncestor(this.object.container, this.target) &&

        // destination in same room as target
        isAncestor(this.object.container, this.destination)
  }

  override do () {
    putInsideContainer(this.destination, this.target, this.spot)
  }
}
serializable(TransferAction)