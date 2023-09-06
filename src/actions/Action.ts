import Effect from '../effects/Effect'
import type GameObject from '../GameObject'
import { game } from '../Game'
import { serializable } from '../serialize'
import { toPrecision } from '../util'

export default class Action extends Effect {
  static duration = 2
  finishTime: number

  get duration () {
    return (this.constructor as typeof Action).duration
  }

  get name (): string | (string | GameObject)[] {
    return this.constructor.name
  }

  // Called after the specified duration elapses
  do? (): void

  override activate () {
    if (this.isActive) {
      return this
    }

    super.activate()

    this.object.activeAction?.deactivate()
    this.object.activeAction = this

    this.finishTime = game.time.current + this.duration

    this.runIn(this.duration)

    this.object.emit('actionStart', this)

    return this
  }

  override deactivate () {
    if (!this.isActive) {
      return this
    }

    super.deactivate()

    if (this.object.activeAction === this) {
      this.object.activeAction = undefined as any
    }

    this.object.emit('actionEnd', this)

    return this
  }

  override run () {
    if (this.condition()) {
      this.do?.()
    }

    this.deactivate()
  }

  condition () {
    return true
  }
}

serializable(Action, {
  transform: {
    finishTime: (time) => toPrecision(time, 1),
  },
})