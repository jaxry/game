import Action from '../behavior/Action'
import { serializable } from '../serialize'
import GameTime from '../GameTime'

export default class WaitAction extends Action {
  override time = 1 * GameTime.second

  override get name () {
    return 'wait'
  }

  override do () {

  }
}
serializable(WaitAction)