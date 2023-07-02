import Effect from './Effect'
import { randomCentered, randomSetElement } from '../util'
import { spawn } from '../behavior/spawn'
import { typeTree } from '../objects/tree'
import { game } from '../Game'
import { serializable } from '../serialize'

export default class SpawnTrees extends Effect {

  queue () {
    this.runIn(8 * (1 + randomCentered()))
  }

  override onActivate () {
    this.queue()
  }

  override run () {
    if (game.energyPool > typeTree.energy) {
      const zone = randomSetElement(this.object.contains)
      const tree = spawn(typeTree, zone)
      game.energyPool -= tree.energy
    }

    this.queue()
  }
}
serializable(SpawnTrees)