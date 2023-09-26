import Effect from './Effect.ts'
import { isEqual } from '../util/util.ts'
import Entity from '../Entity.ts'
import Mine from './actions/Mine.ts'
import { serializable } from '../util/serialize.ts'
import Transfer from './actions/Transfer.ts'
import { getCell, getEmptyNeighbors, getNeighbors } from '../logic/grid.ts'
import { destroy } from '../logic/destroy.ts'
import Move from './actions/Move.ts'
import { entityChildren } from '../logic/container.ts'
import PathMove from '../logic/PathMove.ts'

export default class Warper extends Effect {
  pathMove: PathMove
  miningTarget?: { x: number, y: number }

  constructor (public chest: Entity) {
    super()
  }

  queue () {
    this.runIn(1)
  }

  wait () {
    this.runIn(16)
  }

  override onActivate () {
    this.pathMove = new PathMove(this.entity)
    this.queue()
  }

  override events () {
    this.onEntity('actionEnd', () => {
      this.queue()
    })
  }

  override run () {
    const materializer = this.hasMaterializer()
    if (!materializer) {
      this.obtainMaterializer()
    } else {
      this.useMaterializer(materializer)
    }
  }

  hasMaterializer () {
    return entityChildren(this.entity, (item) => {
      if (item.materializer) {
        return item
      }
    })
  }

  obtainMaterializer () {
    if (this.entity.parent === this.chest.parent) {
      this.grabMaterializer()
    } else {
      this.returnHome()
    }
  }

  grabMaterializer () {
    const materializer = findMaterializer(this.entity, this.chest)
    if (materializer) {
      new Transfer(materializer, this.entity).activate(this.entity)
    } else {
      this.wait()
    }
  }

  returnHome () {
    const next = this.pathMove.next(this.chest.parent)
    if (next) {
      new Move(next).activate(this.entity)
    } else {
      this.wait()
    }
  }

  useMaterializer (materializer: Entity) {
    if (this.miningTarget) {
      this.getToMiningTarget(materializer)
    } else {
      this.mineOrShuffle(materializer)
    }
  }

  getToMiningTarget (materializer: Entity) {
    const world = this.entity.parent.parent
    const zone = getCell(world, this.miningTarget!.x, this.miningTarget!.y)
    const next = zone && this.pathMove.next(zone)
    if (next) {
      return new Move(next).activate(this.entity)
    } else {
      this.miningTarget = undefined
      this.mineOrShuffle(materializer)
    }
  }

  mineOrShuffle (materializer: Entity) {
    const zone = this.entity.parent
    this.miningTarget = getEmptyNeighbors(zone, (position) => {
      if (!isBeingMined(zone, position)) {
        return position
      }
    })
    if (this.miningTarget) {
      destroy(materializer)
      new Mine(this.miningTarget).activate(this.entity)
    } else {
      this.shuffle()
    }
  }

  shuffle () {
    const neighbor = getNeighbors(this.entity.parent, (neighbor) => neighbor)!
    new Move(neighbor).activate(this.entity)
  }
}
serializable(Warper)

function findAction (zone: Entity, find: (action: Effect) => boolean) {
  return entityChildren(zone, (entity) => {
    const action = entity.activeAction
    if (action && find(action)) {
      return action
    }
  })
}

function isBeingMined (zone: Entity, target: { x: number, y: number }) {
  return findAction(zone,
      (action) => action instanceof Mine && isEqual(action.target, target))
}

function findMaterializer (actor: Entity, chest: Entity) {
  const zone = actor.parent

  return entityChildren(chest, (item) => {
    if (!item.materializer) {
      return
    }

    if (findAction(zone,
        (action) => action instanceof Transfer && action.item === item)) {
      return
    }

    return item
  })
}