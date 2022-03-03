import { Action } from '../behavior/Action'
import type { GameObject } from '../GameObject'
import { isAncestor, putInsideContainer } from '../behavior/container'
import { game } from '../Game'
import { inPlayerBubble, isPlayer } from '../behavior/player'

export default class TransferAction extends Action {
  static override effectName = 'transfer'

  override time = 5

  constructor(
      object: GameObject, public item: GameObject,
      public destination: GameObject) {
    super(object)
  }

  override condition() {
    return this.item.container !== this.destination &&
        !isAncestor(this.item, this.destination) &&
        isAncestor(this.object.container, this.item) &&
        isAncestor(this.object.container, this.destination)
  }

  override onActivate() {
    if (inPlayerBubble(this.object)) {
      const insideObject = this.item.container === this.object
      if (isAncestor(this.object, this.item)) {
        game.log.write(this.object,
            ` ${isPlayer(this.object) ? `grab` : `grabs`} `,
            this.item, ` from `,
            insideObject
                ? `${isPlayer(this.object) ? `your` : `their`} bag`
                : this.item.container)

      } else {
        const isOnGround = this.item.container === this.object.container
        game.log.write(this.object, ` pick up `, this.item, ` from `,
            isOnGround ? `the ground` : this.item.container)
      }
    }
  }

  override do() {
    putInsideContainer(this.destination, this.item)

    if (inPlayerBubble(this.object)) {
      const insideObject = this.item.container === this.object
      if (this.destination === this.object.container) {
        game.log.write(this.object,
            ` ${isPlayer(this.object) ? `drop` : `drops`} `,
            this.item, ` on the ground`)
      } else {
        game.log.write(this.object,
            ` ${isPlayer(this.object) ? `stash` : `stashes`} `,
            this.item, ` in `,
            insideObject
                ? `${isPlayer(this.object) ? `your` : `their`} bag`
                : this.item.container)
      }
    }
  }
}