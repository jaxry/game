import { Action } from '../behavior/Action'
import { markDestroy } from '../behavior/destroy'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import { inPlayerBubble } from '../behavior/player'
import { isAncestor } from '../behavior/container'
import { interruptPlayerLoop } from '../behavior/core'

export default class AttackAction extends Action {
  static override effectName = `attack`
  static override canInterrupt = false

  override time = 3

  constructor(attacker: GameObject, public target: GameObject) {
    super(attacker)
  }

  override condition() {
    return this.target.health &&
        isAncestor(this.object.container, this.target) &&
        this.object.spot === this.target.spot
  }

  override do() {
    if (this.target.health) {
      this.target.health--
      if (this.target.health <= 0) {
        markDestroy(this.target)
      }
    }
  }
}