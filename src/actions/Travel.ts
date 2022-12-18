import Action from '../behavior/Action'
import { putInsideContainer } from '../behavior/container'
import type GameObject from '../GameObject'
import { serializable } from '../serialize'

export default class TravelAction extends Action {
  constructor (object: GameObject, public location: GameObject) {
    super(object)
    this.time = 3
  }

  override get name () {
    return 'travel'
  }

  override get icon () {
    return '🥾'
  }

  override do () {
    putInsideContainer(this.location, this.object)
  }
}
serializable(TravelAction)