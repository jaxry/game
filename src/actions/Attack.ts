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

  constructor(attacker: GameObject, public subject: GameObject) {
    super(attacker)
  }

  override condition() {
    return this.subject.health &&
        isAncestor(this.object.container, this.subject) &&
        this.object.spot === this.subject.spot
  }

  override onActivate() {
    if (inPlayerBubble(this.object)) {
      interruptPlayerLoop()
    }
  }

  override do() {
    if (this.subject.health) {
      this.subject.health--
      if (this.subject.health <= 0) {
        markDestroy(this.subject)
      }
    }
  }
}