import Action from './Action'
import type GameObject from '../GameObject'
import { isAncestor, putInsideContainer } from '../behavior/container'
import { serializable } from '../serialize'

export default class TransferAction extends Action {
  static override duration = 3

  constructor (
      object: GameObject, public item: GameObject,
      public destination: GameObject) {
    super(object)

    this.target = this.destination === this.object ? item :
        [item, destination]
  }

  override get name () {
    if (this.destination === this.object) {
      return [`pick up`, this.item]
    } else if (this.destination === this.object.container) {
      return [`drop`, this.item]
    } else {
      return [`move`, this.item, `to`, this.destination]
    }
  }

  override condition () {
    // moving to a different container
    return this.item.container !== this.destination &&

        // not moving target to an item it contains
        !isAncestor(this.item, this.destination) &&

        // object in same room as target
        isAncestor(this.object.container, this.item) &&

        // destination in same room as target
        isAncestor(this.object.container, this.destination)
  }

  override do () {
    putInsideContainer(this.destination, this.item)
  }
}
serializable(TransferAction)