import { Action } from '../behavior/Action'
import { game } from '../Game'

export default class WaitAction extends Action {
  static override effectName = `Wait`

  time = 1

  do() {
    if (this.object === game.player) {
      game.log.write(this.object, ` wait for a bit`)
    }
  }
}
