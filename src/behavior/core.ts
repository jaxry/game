import { game } from '../Game'
import Effect from '../effects/Effect'
import GameTime from '../GameTime'

export function runEffectIn (effect: Effect, timeFromNow: number) {
  if (effect.tick) {
    game.timedEffects.add(effect, game.time.current + timeFromNow)
  }
}

function tick (elapsedGameTime = 0) {
  const finalTime = game.time.current + elapsedGameTime

  while (finalTime >= game.timedEffects.peekPriority()) {
    game.time.current = game.timedEffects.peekPriority()
    const effect = game.timedEffects.pop()
    // effect may have been deactivated since it was added to the queue
    if (effect.isActive) {
      effect.tick!()
    }
  }

  game.time.current = finalTime
  game.event.tick.emit()
}

let timeout: NodeJS.Timeout | null = null

function gameLoop () {
  tick(100 * GameTime.millisecond)
  timeout = setTimeout(gameLoop, 100)
}

export function startGameLoop () {
  if (!timeout) {
    timeout = setTimeout(gameLoop, 100)
  }
}

export function pauseGameLoop () {
  clearTimeout(timeout!)
  timeout = null
}

let playerEffect: Effect | null = null

export function setPlayerEffect (effect: Effect) {
  playerEffect?.deactivate()
  playerEffect = effect
  playerEffect.activate()
}

