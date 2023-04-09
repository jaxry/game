import Effect from './Effect'
import type GameObject from '../GameObject'
import GameTime from '../GameTime'

export default class Action extends Effect {
  static override tickPriority = 0

  time = GameTime.second

  // for targeted actions such as attacks
  target?: GameObject

  get seconds () {
    return GameTime.seconds(this.time)
  }

  get milliseconds () {
    return GameTime.milliseconds(this.time)
  }

  // Called after the specified time is elapsed
  do? (): void

  override activate () {
    super.activate()

    this.object.activeAction?.deactivate()
    this.object.activeAction = this

    this.object.container.emit('itemActionStart', { action: this })

    return this
  }

  override deactivate () {
    super.deactivate()

    if (this.object.activeAction === this) {
      this.object.activeAction = undefined as any
    }

    this.object.container.emit('itemActionEnd', { action: this })

    return this
  }

  override tick () {
    this.time--

    if (!this.condition()) {
      this.deactivate()

    } else if (this.time <= 0) {
      this.deactivate()
      this.do?.()
    }
  }

  condition () {
    return true
  }
}