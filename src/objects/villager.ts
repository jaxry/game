import TravelAction from '../actions/Travel'
import Effect from '../effects/Effect'
import type GameObject from '../GameObject'
import { randomElement } from '../util'
import { makeType } from '../GameObjectType'
import { serializable } from '../serialize'
import { speak } from '../behavior/speak'
import { typeWood } from './wood'
import TransferAction from '../actions/Transfer'
import { game } from '../Game'
import { findShortestPath } from '../behavior/connections'

class FindWood extends Effect {
  override events () {
    this.onObject('actionEnd', (action) => {
      this.queueTick()
    })
  }

  override onActivate () {
    this.queueTick()
  }

  override tick () {
    const wood = this.findWood()
    if (wood) {
      speak(this.object, 'Collect vood!')
      new TransferAction(this.object, wood, this.object).activate()
    } else {
      speak(this.object, 'No vood. Must find.')
      if (this.object.container.connections?.length) {
        new TravelAction(
            this.object, randomElement(this.object.container.connections))
            .activate()
      }
    }
  }

  private queueTick () {
    this.runTickIn(5 + Math.random() * 5)
  }

  private findWood () {
    for (const object of this.object.container.contains) {
      if (object.type === typeWood && !this.isAlreadyBeingCollected(object)) {
        return object
      }
    }
  }

  private isAlreadyBeingCollected (object: GameObject) {
    for (const o of this.object.container.contains) {
      const collecting = o.activeAction instanceof TransferAction &&
          o.activeAction.item === object
      if (collecting) {
        return true
      }
    }
    return false
  }
}

class MoveToZone extends Effect {
  path: GameObject[] = []

  constructor (object: GameObject, public target: GameObject) {
    super(object)
  }

  override onActivate () {
    this.path = findShortestPath(this.object.container, this.target)!
    this.runTickIn(Math.random())
  }

  override events () {
    this.onObject('enter', () => {
      this.runTickIn(2 * Math.random() + 2)
    })
  }

  override tick () {
    if (this.path.length) {
      new TravelAction(this.object, this.path.pop()!).activate()
    } else {
      this.deactivate()
    }
  }
}

class VillagerMove extends MoveToZone {
  constructor (object: GameObject) {
    super(object, VillagerMove.firstZone()!)
  }

  static firstZone () {
    for (const zone of game.world.contains) {
      return zone
    }
  }

  override onDeactivate () {
    new VillagerSpeak(this.object).replace(this)
  }
}

class VillagerSpeak extends Effect {
  override onActivate () {
    this.runTickIn(1)
  }

  override tick () {
    speak(this.object, 'Hmmmph')
    this.deactivate()
  }
}

serializable(FindWood)

export const typeVillager = makeType({
  name: 'villager',
  isContainer: true,
  description: 'hmmmmph',
  effects: [VillagerMove],
})

