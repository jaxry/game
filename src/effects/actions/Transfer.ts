import { Action, ActionState } from './action.ts'
import Effect from '../Effect.ts'
import { noisy } from '../../util/util.ts'
import Entity from '../../Entity.ts'
import { isAncestor, putInside } from '../../logic/container.ts'
import { LogEntry } from '../../gameLog.ts'
import { serializable } from '../../util/serialize.ts'

export default class Transfer extends Effect implements Action {
  action: ActionState = new ActionState(this)

  constructor (public item: Entity, public to: Entity) {
    super()
  }

  name () {
    return [
      this.isPickingUp() ? 'Picking up' :
          this.isDropping() ? 'Dropping' :
              'Transferring', this.item]
  }

  override onActivate () {
    this.entity.emit('log', this, this.logStart)
    this.action.start(noisy(4))
  }

  override run () {
    this.entity.emit('log', this, this.logEnd)
    putInside(this.item, this.to)
    this.action.end()
  }

  logStart () {
    const log: LogEntry = [this.entity]

    if (this.isPickingUp()) {
      log.push('starts picking up', this.item)
      if (this.item.parent !== this.entity.parent) {
        log.push('from', this.item.parent)
      }
    } else if (this.isDropping()) {
      log.push('starts dropping', this.item)
      if (this.to !== this.entity.parent) {
        log.push('to', this.to)
      }
    } else {
      log.push('starts transferring', this.item, 'from', this.item.parent, 'to',
          this.to)
    }

    return log
  }

  logEnd () {
    const log: LogEntry = [this.entity]

    if (this.isPickingUp()) {
      log.push('picks up', this.item)
      if (this.item.parent !== this.entity.parent) {
        log.push('from', this.item.parent)
      }
    } else if (this.isDropping()) {
      log.push('drops', this.item)
      if (this.to !== this.entity.parent) {
        log.push('to', this.to)
      }
    } else {
      log.push('transfers', this.item, 'from', this.item.parent, 'to', this.to)
    }

    return log
  }

  private isPickingUp () {
    return isAncestor(this.entity, this.to)
  }

  private isDropping () {
    return isAncestor(this.entity, this.item)
  }
}
serializable(Transfer)