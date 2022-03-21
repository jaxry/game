import { Effect } from './Effect'

export class Action extends Effect {
  static override tickPriority = 0

  static canInterrupt = true
  time = 1

  get canInterrupt() {
    return (this.constructor as typeof Action).canInterrupt
  }

  actionTick?(): void

  do?(): void

  override activate() {
    super.activate()

    this.object.activeAction?.deactivate()
    this.object.activeAction = this

    this.object.container.emit('itemActionStart', {action: this})

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
      this.object.container.emit('itemActionFinish', {action: this})
    } else if (!this.condition()) {
      this.deactivate()
    }
  }

  condition() {
    return true
  }
}