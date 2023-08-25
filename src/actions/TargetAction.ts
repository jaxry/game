import Action from './Action'
import GameObject from '../GameObject'
import { isContainedWith } from '../behavior/container'

export default class TargetAction extends Action {
  constructor (object: GameObject, public override target: GameObject) {
    super(object)
  }

  override condition () {
    return isContainedWith(this.object, this.target) &&
        this.object !== this.target
  }
}