import TargetAction from './TargetAction'
import { isAncestor, putInsideContainer } from '../behavior/container'
import { serializable } from '../serialize'

export default class Drop extends TargetAction {
  override get name () {
    return ['Drop', this.target]
  }

  override condition () {
    return isAncestor(this.object, this.target) && this.object !== this.target
  }

  override do () {
    putInsideContainer(this.object.container, this.target)
  }
}
serializable(Drop)