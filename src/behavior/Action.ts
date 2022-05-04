import { Effect } from './Effect'
import type { GameObject } from '../GameObject'

export default class Action extends Effect {
  static override tickPriority = 0

  time = 1

  // for targeted actions such as attacks
  target?: GameObject

  get icon() {
    return '🙾'
  }

  // Called after the specified time is elapsed
  do?(): void

  override activate() {
    super.activate()

    this.object.activeAction?.deactivate()
    this.object.activeAction = this

    this.object.container.emit('itemActionStart', { action: this })

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

    if (this.time <= 0) {
      this.deactivate()
      if (this.condition()) {
        this.do?.()
      }
      this.object.container.emit('itemActionEnd', { action: this })
    } else if (!this.condition()) {
      this.deactivate()
    }
  }

  condition() {
    return true
  }
}