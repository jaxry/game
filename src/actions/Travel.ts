import Action from '../behavior/Action'
import { putInsideContainer } from '../behavior/container'
import type GameObject from '../GameObject'
import { serializable } from '../serialize'
import GameTime from '../GameTime'

export default class TravelAction extends Action {
  override time = 5 * GameTime.second

  constructor (object: GameObject, override target: GameObject) {
    super(object)
  }

  override get name () {
    return 'travel'
  }

  override get icon () {
    return '🥾'
  }

  override do () {
    putInsideContainer(this.target, this.object)
  }
}
serializable(TravelAction)