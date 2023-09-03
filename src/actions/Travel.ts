import { isAncestor, putInsideContainer } from '../behavior/container'
import { serializable } from '../serialize'
import TargetAction from './TargetAction'

export default class TravelAction extends TargetAction {
  static override duration = 3

  override get name () {
    return `travel`
  }

  override condition () {
    return !isAncestor(this.object, this.target)
  }

  override do () {
    putInsideContainer(this.target, this.object)
  }
}
serializable(TravelAction)