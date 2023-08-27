import Effect from './Effect'
import { noisy, randomSetElement } from '../util'
import { spawn } from '../behavior/spawn'
import { typeTree } from '../objects/tree'
import { serializable } from '../serialize'
import { getWorldEnergy, takeEnergyFromWorld } from '../behavior/energy'

export default class SpawnTrees extends Effect {

  queue () {
    this.runIn(noisy(8))
  }

  override onActivate () {
    this.queue()
  }

  override run () {
    if (getWorldEnergy() > typeTree.energy) {
      takeEnergyFromWorld(typeTree.energy)
      spawn(typeTree, randomSetElement(this.object.contains))
    }

    this.queue()
  }
}
serializable(SpawnTrees)