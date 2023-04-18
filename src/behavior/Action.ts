import Effect from './Effect'
import type GameObject from '../GameObject'
import GameTime from '../GameTime'
import { game } from '../Game'
import { serializable } from '../serialize'
import { toPrecision } from '../util'

export default class Action extends Effect {
  static duration = GameTime.second
  time: number

  get duration () {
    return (this.constructor as typeof Action).duration
  }

  // for targeted actions such as attacks
  target?: GameObject | GameObject[]

  get name (): string | (string | GameObject)[] {
    return this.constructor.name
  }

  // Called after the specified duration elapses
  do? (): void

  override activate () {
    super.activate()

    this.object.activeAction?.deactivate()
    this.object.activeAction = this

    this.time = game.time.current + this.duration
    this.tickIn(this.duration)

    this.object.container.emit('childActionStart', { action: this })

    return this
  }

  override deactivate () {
    super.deactivate()

    if (this.object.activeAction === this) {
      this.object.activeAction = undefined as any
    }

    this.object.container.emit('childActionEnd', { action: this })

    return this
  }

  override tick () {
    this.deactivate()

    if (this.condition()) {
      this.do?.()
    }
  }

  condition () {
    return true
  }
}

serializable(Action, {
  transform: {
    time: (time) => toPrecision(time, 1)
  }
})