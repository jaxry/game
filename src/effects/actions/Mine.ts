import Effect from '../Effect.ts'
import { Action, ActionState } from './action.ts'
import { noisy } from '../../util/util.ts'
import { serializable } from '../../util/serialize.ts'
import { makeZone } from '../../logic/zone.ts'
import {
  angleToDirectionName, directionName, NamedEntity,
} from '../../gameLog.ts'
import { getCell } from '../../logic/grid.ts'

export default class Mine extends Effect implements Action {
  action: ActionState = new ActionState(this)

  constructor (public target: { x: number, y: number }) {
    super()
  }

  name () {
    return [`Mining ${this.getDirection()}`]
  }

  override onActivate () {
    this.entity.emit('log', this, this.logStart)
    this.action.start(noisy(4))
  }

  override run () {
    const map = this.entity.parent.parent
    makeZone(map, this.target.x, this.target.y)
    this.entity.emit('log', this, this.logFinish)
    this.action.end()
  }

  logStart () {
    return [this.entity, ` starts mining ${this.getDirection()}.`]
  }

  logFinish () {
    const zone = this.entity.parent
    const newZone = getCell(zone.parent, this.target.x, this.target.y)!
    return [
      this.entity, `mines a new area`,
      new NamedEntity(newZone, directionName(zone, newZone))]
  }

  getDirection () {
    const dx = this.target.x - this.entity.parent.position!.x
    const dy = this.target.y - this.entity.parent.position!.y
    return angleToDirectionName(dx, dy)
  }
}
serializable(Mine)