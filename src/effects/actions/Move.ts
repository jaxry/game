import Effect from '../Effect.ts'
import { Action, ActionState } from './action.ts'
import Entity from '../../Entity.ts'
import { noisy } from '../../util/util.ts'
import { putInside } from '../../logic/container.ts'
import { serializable } from '../../util/serialize.ts'
import { isDestroyed } from '../../logic/destroy.ts'
import { directionName, LogEntry, NamedEntity } from '../../gameLog.ts'

export default class Move extends Effect implements Action {
  action: ActionState = new ActionState(this)

  from: Entity

  constructor (public to: Entity) {
    super()
  }

  name () {
    return [`Moving`, new NamedEntity(this.to, this.directionTo())]
  }

  override onActivate () {
    this.from = this.entity.parent
    this.entity.emit('log', this, this.logStart)
    this.action.start(noisy(4))
  }

  override run () {
    this.entity.emit('log', this, this.logEnd)
    if (!isDestroyed(this.to)) {
      putInside(this.entity, this.to)
    }
    this.entity.emit('log', this, this.logEnter)
    this.action.end()
  }

  private directionTo () {
    return directionName(this.from, this.to)
  }

  private directionFrom () {
    return directionName(this.to, this.from)
  }

  private logStart () {
    return [this.entity, `starts moving`, ...this.locationName()]
  }

  private logEnd () {
    return [this.entity, `went`, ...this.locationName()]
  }

  private locationName () {
    if (this.to.name) {
      return [` ${this.directionTo()} to`, this.to]
    } else {
      return [new NamedEntity(this.to, this.directionTo())]
    }
  }

  private logEnter () {
    const entry: LogEntry = [this.entity]
    if (this.from.name) {
      entry.push(`came ${this.directionFrom()} from`, this.from)
    } else {
      entry.push('came from', new NamedEntity(this.from, this.directionFrom()))
    }
    return entry
  }
}

serializable(Move)