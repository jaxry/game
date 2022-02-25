import { Effect } from './Effect'

export abstract class Action extends Effect {
  static checkConditionEveryTick = true
  static interruptable = true
  abstract time: number

  get checkConditionEveryTick() {
    return (this.constructor as typeof Action).checkConditionEveryTick
  }

  get interruptable() {
    return (this.constructor as typeof Action).interruptable
  }

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

    if (this.time <= 0) {
      this.deactivate()
      if (this.condition()) {
        this.do()
      }
      this.object.emit('actionEnd', {action: this})
    } else if (this.checkConditionEveryTick && !this.condition()) {
      this.deactivate()
      this.object.emit('actionEnd', {action: this})
    }
  }

  condition() {
    return true
  }

  abstract do(): void
}