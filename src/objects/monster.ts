import AttackAction from '../actions/Attack'
import TravelAction from '../actions/Travel'
import { isContainedWith } from '../behavior/container'
import { Effect } from '../behavior/Effect'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import { makeType } from '../GameObject'
import { randomElement } from '../util'
import MoveSpotAction from '../actions/MoveSpot'
import { isPlayer } from '../behavior/player'

class MonsterAttack extends Effect {
  constructor(object: GameObject, public target: GameObject) {
    super(object)
  }

  override tick() {
    if (Math.random() > 0.5) {
      return
    }

    const active = this.object.activeAction
    const sameSpot = this.object.spot === this.target.spot

    if (isContainedWith(this.object, this.target)) {
      if (!sameSpot && !(active instanceof MoveSpotAction)) {
        const to = this.object.spot + Math.sign(this.target.spot - this.object.spot)
        new MoveSpotAction(this.object, to).activate()
      } else if (sameSpot && !(active instanceof AttackAction)) {
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

    const addEnterListener = () => this.onEvent(
        this.object.container, 'enter',
        ({item}) => {
          if (isPlayer(item)) {
            this.found()
          }
        })

    let enterListener = addEnterListener()

    this.onEvent(this.object, 'move', () => {
      if (isContainedWith(this.object, game.player)) {
        return this.found()
      }
      this.unsubscribe(enterListener)
      enterListener = addEnterListener()
    })
  }

  override tick() {
    if (!this.object.activeAction && Math.random() < 0.5) {
      this.travel()
    }
  }
}

export const typeMonster = makeType({
  name: 'monster',
  properNoun: true,
  description: 'a horrendous creature with sharp claws',
  health: 3,
  effects: [MonsterSearch],
})

