import Action from '../behavior/Action'
import type { GameObject } from '../GameObject'
import { isAncestor, putInsideContainer } from '../behavior/container'

export default class TransferAction extends Action {
  static override effectName = 'transfer'

  override time = 5

  constructor(
      object: GameObject, public item: GameObject,
      public destination: GameObject) {
    super(object)
  }

  override condition() {
    return this.item.container !== this.destination &&
        !isAncestor(this.item, this.destination) &&
        isAncestor(this.object.container, this.item) &&
        isAncestor(this.object.container, this.destination)
  }

  override onActivate() {

  }

  override do() {
    putInsideContainer(this.destination, this.item)
  }
}