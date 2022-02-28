import { Effect } from './Effect'

export class Action extends Effect {
  static override tickPriority = 0

  static canInterrupt = true
  get canInterrupt() {
    return (this.constructor as typeof Action).canInterrupt
  }

  time = 1

  actionTick?(): void
  do?(): void

  override activate() {
    super.activate()

    this.object.activeAction?.deactivate()
    this.object.activeAction = this

    this.object.emit('actionStart', {action: this})

    return this
  }

  override deactivate() {
    super.deactivate()

    if (this.object.activeAction === this) {
      this.object.activeAction = undefined as any
    }

    return this
  }

  override tick() {
    this.time--

    this.actionTick?.()

    if (this.time <= 0) {
      this.deactivate()
      if (this.condition()) {
        this.do?.()
      }
      this.object.emit('actionEnd', {action: this})
    } else if (!this.condition()) {
      this.deactivate()
      this.object.emit('actionEnd', {action: this})
    }
  }

  condition() {
    return true
  }
}