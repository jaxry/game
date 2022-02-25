import { Action } from '../behavior/Action'
import { connectionDistance } from '../behavior/connections'
import { putInsideContainer } from '../behavior/container'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import GameTime from '../GameTime'
import { inPlayerBubble } from '../behavior/player'

export default class TravelAction extends Action {
  static override effectName = 'Travel'

  time: number

  constructor(object: GameObject, public location: GameObject) {
    super(object)
    this.time = Math.round(
        Math.random()
        * GameTime.minute
        * connectionDistance(object.container, location),
    )
  }

  override onActivate() {
    if (inPlayerBubble(this.object)) {
      if (this.object === game.player) {
        game.log.write(this.object, ` start walking to `, this.location)
      } else {
        game.log.write(this.object, ` starts walking to `, this.location)
      }
    }
  }

  do() {
    putInsideContainer(this.location, this.object)

    if (inPlayerBubble(this.object)) {
      if (this.object === game.player) {
        game.log.write(this.object, ` arrive at `, this.location)
      } else if (this.location === game.player.container) {
        game.log.write(this.object, ` enters the area`)
      } else {
        game.log.write(this.object, ` leaves to `, this.location)
      }
    }
  }
}
