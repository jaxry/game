import TravelAction from '../actions/Travel'
import Effect from '../effects/Effect'
import type GameObject from '../GameObject'
import { find, noisy, randomElement } from '../util'
import { makeType } from '../GameObjectType'
import { typeWood } from './wood'
import { findShortestPath, isNeighbor } from '../behavior/connections'
import { typeChest } from './chest'
import { children } from '../behavior/container'
import Hold from '../actions/Hold'
import PutInside from '../actions/PutInside'
import { serializable } from '../serialize'
import { speak } from '../behavior/speak'

class Villager extends Effect {
  queued = false
  home = this.object.container
  path?: GameObject[]

  override events () {
    this.onObject('actionEnd', () => {
      this.queueRun()
    })
    this.onObject('enter', () => {
      this.queueRun()
    })
  }

  override onActivate () {
    this.queueRun()
  }

  queueRun () {
    if (this.queued) return
    this.runIn(noisy(3))
    this.queued = true
  }

  override run () {
    this.queued = false
    const holdingWood = find(children(this.object),
        object => object.type === typeWood)
    holdingWood ? this.returnWood() : this.findWood()
  }

  returnWood () {
    if (this.object.container === this.home) {
      this.depositWood()
    } else {
      this.travelHome()
    }
  }

  depositWood () {
    const chest = find(children(this.object.container),
        object => object.type === typeChest)
    if (chest) {
      new PutInside(this.object, chest).activate()
    }
  }

  travelHome () {
    const validPath = this.path?.length &&
        isNeighbor(this.object.container, this.path.at(-1)!)

    if (!validPath) {
      this.path = findShortestPath(this.object.container, this.home)
      speak(this.object, `Bring wood home!`)
    }

    if (!this.path) return

    const next = this.path.pop()
    new TravelAction(this.object, next!).activate()
    if (this.path.length === 0) {
      this.path = undefined
    }
  }

  findWood () {
    const wood = findWood(this.object)
    if (wood) {
      new Hold(this.object, wood).activate()
    } else {
      const neighboringZone = randomElement(this.object.container.connections)
      new TravelAction(this.object, neighboringZone).activate()
      speak(this.object, `Looking for wood.`)
    }
  }
}

serializable(Villager)

function findWood (object: GameObject) {
  return find(children(object.container), (item) =>
      item.type === typeWood && !isAlreadyBeingGrabbed(item))
}

function isAlreadyBeingGrabbed (item: GameObject) {
  return find(children(item.container),
      (object) => object.activeAction instanceof Hold &&
          object.activeAction.target === item)
}

export const typeVillager = makeType({
  name: 'villager',
  isContainer: true,
  description: 'hmmmmph',
  effects: [Villager],
})

