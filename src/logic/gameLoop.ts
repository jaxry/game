import Effect from '../effects/Effect'
import { game } from '../main'
import Timer from '../util/Timer.ts'

export function runEffectIn (effect: Effect, timeFromNow: number) {
  if (effect.run) {
    game.timedEffects.add(effect, game.time.current + timeFromNow)
  }
}

export function advanceTime (elapsedGameTime: number) {
  const finalTime = game.time.current + elapsedGameTime

  while (game.timedEffects.peekPriority() <= finalTime) {
    game.time.current = game.timedEffects.peekPriority()
    const effect = game.timedEffects.pop()

    // effect has been deactivated since it was added to the queue
    if (!effect.isActive) continue

    effect.run!()
  }

  game.time.current = finalTime
  game.tick.emit()
}

const tickTimer = new Timer()
const tickTime = 0.1
let timeMultiplier = 1

function tick () {
  advanceTime(tickTime * timeMultiplier)
  tickTimer.start(tick, 1000 * tickTime)
}

export function startGameLoop () {
  tickTimer.start(tick, 1000 * tickTime)
}

export function pauseGameLoop () {
  tickTimer.stop()
}

export function setGameSpeed (speed: number) {
  timeMultiplier = speed
}

export function gameSpeed () {
  return timeMultiplier
}