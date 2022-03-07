import { Action } from '../behavior/Action'
import { markDestroy } from '../behavior/destroy'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import { inPlayerBubble } from '../behavior/player'
import { isAncestor } from '../behavior/container'

export default class AttackAction extends Action {
  static override effectName = `attack`
  static override canInterrupt = false

  override time = 3

  constructor(attacker: GameObject, public subject: GameObject) {
    super(attacker)
  }

  override condition() {
    return this.subject.health && isAncestor(this.object.container, this.subject)
  }

  override onActivate() {
    if (inPlayerBubble(this.object)) {
      // if (this.object === game.player) {
      //   game.log.writeImportant(this.object, ` aim at `,
      //       this.subject)
      // } else {
      //   game.log.writeImportant(this.object, ` aims at `,
      //       this.subject)
      // }
      game.objectLog.write(this.object, `starts to attack `)
    }
  }

  override do() {
    if (inPlayerBubble(this.object)) {
      // if (this.object === game.player) {
      //   game.log.writeImportant(this.object, ` punch `, this.subject)
      // } else {
      //   game.log.writeImportant(this.object, ` punches `, this.subject)
      // }
      game.objectLog.write(this.object, `attacks ${this.subject.type.name}`)
    }

    if (this.subject.health) {
      this.subject.health--
      if (this.subject.health <= 0) {
        markDestroy(this.subject)

        if (inPlayerBubble(this.subject)) {
          // if (this.object === game.player) {
          //   game.log.writeImportant(this.object, ` destroy `, this.subject)
          // } else {
          //   game.log.writeImportant(this.object, ` destroys `, this.subject)
          // }
        }
      }
    }
  }
}