import Entity from '../Entity.ts'
import { addCell, canDeleteWithoutSeparating, getCell } from './grid.ts'
import Effect from '../effects/Effect.ts'
import { destroy } from './destroy.ts'
import { noisy } from '../util/util.ts'
import { game } from '../main.ts'
import { serializable } from '../util/serialize.ts'
import { numberOfChildren } from './container.ts'

export function makeZone (map: Entity, x: number, y: number) {
  let zone = getCell(map, x, y)

  if (zone) {
    return zone
  }

  zone = new Entity()

  new Collapsable().activate(zone)

  addCell(map, zone, x, y)

  return zone
}

class Collapsable extends Effect {
  override onActivate () {
    this.collapseIfEmpty()
  }

  collapseIfEmpty () {
    if (numberOfChildren(this.entity) === 0) {
      this.replaceWith(new Collapse())
    }
  }

  override events () {
    this.onEntityChildren('leave', () => {
      this.collapseIfEmpty()
    })
  }
}

serializable(Collapsable)

class Collapse extends Effect {
  queue () {
    this.runIn(noisy(60))
  }

  override onActivate () {
    this.queue()
  }

  override run () {
    if (canDeleteWithoutSeparating(this.entity)) {
      destroy(this.entity)
    } else {
      this.queue()
    }
  }

  override events () {
    this.onEntityChildren('enter', () => {
      this.replaceWith(new Collapsable())
    })
  }
}

serializable(Collapse)

export function changedViewedZoned (zone: Entity) {
  game.viewedZone = zone
  game.viewedZoneChanged.emit(zone)
}