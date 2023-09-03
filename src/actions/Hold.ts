import { holdItem, numberOfChildren } from '../behavior/container'
import { ContainedAs } from '../GameObject'
import TargetAction from './TargetAction'
import { serializable } from '../serialize'

export default class Hold extends TargetAction {
  override get name () {
    return ['Hold', this.target]
  }

  override condition () {
    return super.condition() &&
        !(this.target.container === this.object &&
            this.target.containedAs === ContainedAs.holding) &&
        numberOfChildren(this.object, ContainedAs.holding) < 2
  }

  override do () {
    holdItem(this.object, this.target)
  }
}
serializable(Hold)
