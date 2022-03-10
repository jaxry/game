import AttackAction from '../actions/Attack'
import TravelAction from '../actions/Travel'
import { isContainedWith } from '../behavior/container'
import { Effect } from '../behavior/Effect'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import { makeType } from '../GameObject'
import { randomElement } from '../util'
import MoveSpotAction from '../actions/MoveSpot'

class MonsterAttack extends Effect {
  constructor(object: GameObject, public target: GameObject) {
    super(object)
  }

  override tick() {
    if (this.object.activeAction) {
      return
    }

    if (isContainedWith(this.object, this.target)) {
      if (this.object.spot !== this.target.spot) {
        new MoveSpotAction(this.object, this.object.spot + Math.sign(this.target.spot - this.object.spot)).activate()
      } else {
        new AttackAction(this.object, this.target).activate()
      }
    } else {
      this.deactivate()
      new MonsterSearch(this.object).activate()
    }
  }
}

class MonsterSearch extends Effect {
  found() {
    this.object.activeAction?.deactivate()
    this.deactivate()
    new MonsterAttack(this.object, game.player).activate()
  }

  travel() {
    if (!this.object.container.connections) {
      return
    }
    const location = randomElement(this.object.container.connections)
    new TravelAction(this.object, location).activate()
  }

  override onActivate() {
    if (isContainedWith(this.object, game.player)) {
      return this.found()
    }

    const addReceiveListener = () => this.onEvent(
        this.object.container, 'receive',
        (_, {receiving}) => {
          if (receiving === game.player) {
            this.found()
          }
        })

    let receiveListener = addReceiveListener()

    this.onEvent(this.object, 'move', () => {
      if (isContainedWith(this.object, game.player)) {
        return this.found()
      }
      this.unsubscribe(receiveListener)
      receiveListener = addReceiveListener()
    })

    this.onEvent(this.object, 'actionEnd', () => {
      this.travel()
    })

    this.travel()
  }
}

export const typeMonster = makeType({
  name: 'rai',
  properNoun: true,
  description: 'a horrendous creature with sharp claws',
  health: 3,
  effects: [MonsterSearch],
})

