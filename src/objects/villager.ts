import TravelAction from '../actions/Travel'
import Effect from '../effects/Effect'
import type GameObject from '../GameObject'
import { randomElement } from '../util'
import { makeType } from '../GameObjectType'
import { speak } from '../behavior/speak'
import { typeWood } from './wood'
import TransferAction from '../actions/Transfer'
import { findShortestPath } from '../behavior/connections'

class MoveToZone extends Effect {
  path: GameObject[] = []

  constructor (object: GameObject, public target: GameObject) {
    super(object)
  }

  override onActivate () {
    this.path = findShortestPath(this.object.container, this.target)!
    this.runIn(Math.random())
  }

  override events () {
    this.onObject('enter', () => {
      this.runIn(2 * Math.random() + 2)
    })
  }

  override run () {
    if (this.path.length) {
      new TravelAction(this.object, this.path.pop()!).activate()
    } else {
      this.deactivate()
    }
  }
}

class Search extends Effect {
  home = this.object.container

  override onActivate () {
    this.runIn(1 + Math.random())
  }

  override events () {
    this.onObject('enter', () => {
      this.runIn(1 + Math.random())
    })
    this.onObjectChildren('enter', (item) => {
      if (item.type === typeWood) {
        new ReturnHome(this.object, this.home).replace(this)
      }
    })
  }

  override run () {
    const wood = findWood(this.object.container)
    if (wood) {
      new TransferAction(this.object, wood, this.object).activate()
    } else {
      const nextZone = randomElement(this.object.container.connections!)
      new TravelAction(this.object, nextZone).activate()
    }
  }
}

class ReturnHome extends MoveToZone {
  constructor (object: GameObject, home: GameObject) {
    super(object, home)
  }

  override onActivate () {
    super.onActivate()
    speak(this.object, 'Return wood')
  }

  override onDeactivate () {
    speak(this.object, 'Returned')
  }
}

function findWood (zone: GameObject) {
  for (const object of zone.contains) {
    if (object.type === typeWood && !isAlreadyBeingCollected(object)) {
      return object
    }
  }
}

function isAlreadyBeingCollected (item: GameObject) {
  for (const object of item.container.contains) {
    if (object.activeAction instanceof TransferAction &&
        object.activeAction.item === item) {
      return true
    }
  }
  return false
}

export const typeVillager = makeType({
  name: 'villager',
  isContainer: true,
  description: 'hmmmmph',
  effects: [Search],
})

