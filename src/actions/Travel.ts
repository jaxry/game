import Action from '../behavior/Action'
import { putInsideContainer } from '../behavior/container'
import type GameObject from '../GameObject'
import { serializable } from '../serialize'
import GameTime from '../GameTime'

export default class TravelAction extends Action {
  override time = 3 * GameTime.second

  constructor (object: GameObject, public location: GameObject) {
    super(object)
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