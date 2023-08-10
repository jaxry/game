import TravelAction from '../actions/Travel'
import Effect from '../effects/Effect'
import type GameObject from '../GameObject'
import { randomElement } from '../util'
import { makeType } from '../GameObjectType'
import { speak } from '../behavior/speak'
import { typeWood } from './wood'
import TransferAction from '../actions/Transfer'
import { findShortestPath } from '../behavior/connections'
import { typeChest } from './chest'
import { serializable } from '../serialize'

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
      this.runIn(Math.random())
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
  home: GameObject

  override onActivate () {
    this.home = this.object.container
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
      speak(this.object, 'Found me some wood.')
    } else {
      const nextZone = randomElement(this.object.container.connections!)
      new TravelAction(this.object, nextZone).activate()
      speak(this.object, 'No wood, must explore.')
    }
  }
}

serializable(Search)

class ReturnHome extends MoveToZone {
  constructor (object: GameObject, home: GameObject) {
    super(object, home)
  }

  override onActivate () {
    super.onActivate()
    speak(this.object, 'Returning wood to home.')
  }

  override onDeactivate () {
    const chest = findChest(this.object.container)!
    const wood = findWood(this.object)!
    new DepositWood(this.object, wood, chest).activate()
    speak(this.object, 'Depositing wood.')
  }
}

serializable(ReturnHome)

class DepositWood extends TransferAction {
  override onDeactivate () {
    new Search(this.object).activate()
    speak(this.object, 'Back to searching.')
  }
}

serializable(DepositWood)

function findChest (zone: GameObject) {
  for (const object of zone.contains) {
    if (object.type === typeChest) {
      return object
    }
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

