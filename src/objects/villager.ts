import TravelAction from '../actions/Travel'
import Effect from '../effects/Effect'
import type GameObject from '../GameObject'
import { randomElement } from '../util'
import { makeType } from '../GameObjectType'
import { serializable } from '../serialize'
import { speak } from '../behavior/speak'
import { typeWood } from './wood'
import TransferAction from '../actions/Transfer'

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

serializable(FindWood)

export const typeVillager = makeType({
  name: 'villager',
  isContainer: true,
  description: 'hmmmmph',
  health: 3,
  effects: [FindWood],
})

