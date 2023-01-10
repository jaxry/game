import AttackAction from '../actions/Attack'
import TravelAction from '../actions/Travel'
import { isContainedWith } from '../behavior/container'
import Effect from '../behavior/Effect'
import { game } from '../Game'
import type GameObject from '../GameObject'
import { randomElement } from '../util'
import MoveSpotAction from '../actions/MoveSpot'
import { makeType } from '../GameObjectType'
import { serializable } from '../serialize'
import { isPlayer } from '../behavior/player'

class MonsterAttack extends Effect {
  constructor (object: GameObject, public target: GameObject) {
    super(object)
  }

  override tick () {
    if (Math.random() > 0.05) {
      return
    }

    const active = this.object.activeAction
    const sameSpot = this.object.spot === this.target.spot

    if (isContainedWith(this.object, this.target)) {
      if (!sameSpot && !(active instanceof MoveSpotAction)) {
        new MoveSpotAction(this.object, this.target.spot).activate()
      } else if (sameSpot && !(active instanceof AttackAction)) {
        new AttackAction(this.object, this.target).activate()
      }
    } else {
      this.deactivate()
      new MonsterSearch(this.object).activate()
    }
  }
}

serializable(MonsterAttack)

class MonsterSearch extends Effect {
  found () {
    this.object.activeAction?.deactivate()
    this.deactivate()
    new MonsterAttack(this.object, game.player).activate()
  }

  travel () {
    if (!this.object.container.connections) {
      return
    }
    const location = randomElement(this.object.container.connections)
    new TravelAction(this.object, location).activate()
  }

  override events () {
    this.on(this.object.container, 'enter', ({ item }) => {
      if (isPlayer(item)) {
        this.found()
      }
    })

    this.on(this.object.container, 'leave', ({ item }) => {
      if (item !== this.object) {
        return
      }
      this.reactivate()
    })
  }

  override onActivate () {
    if (isContainedWith(this.object, game.player)) {
      return this.found()
    }
  }

  override tick () {
    if (!this.object.activeAction && Math.random() < 0.03) {
      this.travel()
    }
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

