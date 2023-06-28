import Effect from '../effects/Effect'
import { makeType } from '../GameObjectType'
import { speak } from '../behavior/speak'
import { spawn } from '../behavior/spawn'
import { takeEnergyFromWorld } from '../behavior/energy'
import { randomElement } from '../util'

class Photosynthesis extends Effect {
  override onActivate () {
    this.queue()
  }

  queue () {
    this.runIn(1 + Math.random())
  }

  override run () {
    this.object.energy += takeEnergyFromWorld(1)
    speak(this.object, `Energy: ${this.object.energy}`)
    this.queue()
  }
}

class Tree extends Effect {
  override onActivate () {
    new Photosynthesis(this.object).activate()
    this.queue()
  }

  reproduce () {
    this.object.energy -= typeTree.energy

    const zone = randomElement(
        [this.object.container, ...this.object.container.connections])

    spawn(typeTree, zone)
  }

  override run () {
    if (this.object.energy > typeTree.energy * 3) {
      this.reproduce()
    }


    this.queue()
  }

  queue () {
    this.runIn(10 + 10 * Math.random())
  }
}

export const typeTree = makeType({
  name: 'tree',
  energy: 5,
  effects: [Tree],
})