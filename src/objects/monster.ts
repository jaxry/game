import AttackAction from '../actions/Attack'
import TravelAction from '../actions/Travel'
import { isContainedWith } from '../behavior/container'
import Effect from '../behavior/Effect'
import { game } from '../Game'
import type GameObject from '../GameObject'
import { randomElement } from '../util'
import { makeType } from '../GameObjectType'
import { serializable } from '../serialize'
import { isPlayer } from '../behavior/player'

class MonsterAttack extends Effect {
  constructor (object: GameObject, public target: GameObject) {
    super(object)
  }

  override events () {
    this.onContainer('leave', ({ object }) => {
      if (object === this.object || object === game.player) {
        this.deactivate()
        new MonsterSearch(this.object).activate()
      }
    })
    this.onContainer('childActionEnd', ({ action }) => {
      if (action.object === this.object) {
        this.tickInTime(15 * Math.random())
      }
    })
  }

  override onActivate () {
    this.tickInTime(15 * Math.random())
  }

  override tick () {
    new AttackAction(this.object, this.target).activate()
  }
}

serializable(MonsterAttack)

class MonsterSearch extends Effect {
  found () {
    this.deactivate()
    new MonsterAttack(this.object, game.player).activate()
  }

  lookForPlayer () {
    if (isContainedWith(this.object, game.player)) {
      return this.found()
    }

    this.tickInTime(15 * Math.random())
  }

  override events () {
    this.onContainer('enter', ({ object }) => {
      if (isPlayer(object)) {
        this.found()
      }
    })

    this.onContainer('leave', ({ object }) => {
      if (object === this.object) {
        this.reregisterEvents()
        this.lookForPlayer()
      }
    })
  }

  override onActivate () {
    this.lookForPlayer()
  }

  override tick () {
    if (!this.object.container.connections) {
      return
    }
    const location = randomElement(this.object.container.connections)
    return new TravelAction(this.object, location).activate()
  }
}

serializable(MonsterSearch)

export const typeMonster = makeType({
  name: 'Ogre Magi',
  icon: '👹',
  properNoun: true,
  description: 'a horrendous creature with sharp claws',
  health: 3,
  effects: [MonsterSearch],
})

