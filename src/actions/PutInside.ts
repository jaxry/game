import TargetAction from './TargetAction'
import { ContainedAs } from '../GameObject'
import {
  childrenOfType, isAncestor, numberOfChildren, putInsideContainer,
} from '../behavior/container'
import { every } from '../util'

export default class PutInside extends TargetAction {
  static override duration = 2

  override condition () {
    return super.condition() &&
        this.target.type.isContainer &&
        numberOfChildren(this.object, ContainedAs.holding) > 0 &&
        every(childrenOfType(this.object, ContainedAs.holding), (item) => !isAncestor(item, this.target))
  }

  override do () {
    for (const item of childrenOfType(this.object, ContainedAs.holding)) {
      putInsideContainer(this.target, item)
    }
  }
}