import Action from '../behavior/Action'
import { markDestroy } from '../behavior/destroy'
import type { GameObject } from '../GameObject'
import { isAncestor } from '../behavior/container'

export default class AttackAction extends Action {
  override time = 3

  constructor (attacker: GameObject, public override target: GameObject) {
    super(attacker)
  }

  override get name () {
    return `attacking ${this.target.type.name}`
  }

  override get icon () {
    return `⚔️${this.target.type.icon}`
  }

  override condition () {
    return this.target.health > 0 &&
        isAncestor(this.object.container, this.target) &&
        this.object.spot === this.target.spot
  }

  override do () {
    if (this.target.health) {
      this.target.health--
      if (this.target.health <= 0) {
        markDestroy(this.target)
      }
    }
  }
}