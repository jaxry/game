import Effect from './Effect'
import { noisy, randomSetElement } from '../util'
import { spawn } from '../behavior/spawn'
import { typeTree } from '../objects/tree'
import { serializable } from '../serialize'
import { getWorld } from '../behavior/general'

export default class SpawnTrees extends Effect {

  queue () {
    this.runIn(noisy(16))
  }

  override onActivate () {
    this.queue()
  }

  override run () {
    if (getWorld().energy > 0) {
      spawn(typeTree, randomSetElement(this.object.contains))
    }

    this.queue()
  }
}
serializable(SpawnTrees)