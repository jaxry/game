import Effect from '../Effect.ts'
import { game } from '../../main.ts'
import { serializable } from '../../util/serialize.ts'
import { LogEntry } from '../../gameLog.ts'

export class ActionState {
  timeEnd: number

  constructor (public effect: Action) {
  }

  start (duration: number) {
    this.timeEnd = game.time.current + duration
    this.effect.runIn(duration)
    this.effect.entity.activeAction = this.effect
    this.effect.entity.emit('actionStart', this.effect)
  }

  end () {
    this.effect.deactivate()
    if (this.effect.entity.activeAction === this.effect) {
      this.effect.entity.activeAction = undefined
    }
    this.effect.entity.emit('actionEnd', this.effect)
  }
}
serializable(ActionState)

export interface Action extends Effect {
  action: ActionState
  name (): LogEntry
}

export function actionTimeLeft (effect: Action) {
  return effect.action.timeEnd - game.time.current
}