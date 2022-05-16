import Action from '../behavior/Action'
import type { GameObject } from '../GameObject'
import { isAncestor, putInsideContainer } from '../behavior/container'

export default class TransferAction extends Action {
  override time = 5

  constructor(
      object: GameObject, public target: GameObject,
      public destination: GameObject) {
    super(object)
  }

  override get name() { return 'transfer' }

  override get icon() { return `🖐${this.target.type.icon}` }

  override condition() {
    return this.target.container !== this.destination &&
        !isAncestor(this.target, this.destination) &&
        isAncestor(this.object.container, this.target) &&
        isAncestor(this.object.container, this.destination)
  }

  override do() {
    putInsideContainer(this.destination, this.target)
  }
}