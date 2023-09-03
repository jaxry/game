import TargetAction from './TargetAction'
import { ContainedAs } from '../GameObject'
import {
  childrenOfType, isAncestor, isContainedWith, numberOfChildren,
  putInsideContainer,
} from '../behavior/container'
import { every } from '../util'
import { serializable } from '../serialize'

export default class PutInside extends TargetAction {
  override get name () {
    return [`Put in`, this.target]
  }

  override condition () {
    return isContainedWith(this.object, this.target) &&
        this.target.type.isContainer &&
        numberOfChildren(this.object, ContainedAs.holding) > 0 &&
        every(childrenOfType(this.object, ContainedAs.holding),
            (item) => !isAncestor(item, this.target))
  }

  override do () {
    for (const item of childrenOfType(this.object, ContainedAs.holding)) {
      putInsideContainer(this.target, item)
    }
  }
}
serializable(PutInside)