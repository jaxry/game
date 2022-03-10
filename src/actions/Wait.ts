import { Action } from '../behavior/Action'
import { game } from '../Game'

export default class WaitAction extends Action {
  static override effectName = `Wait`

  override time = 1

  override do() {

  }
}
