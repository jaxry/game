import { game } from '../Game'
import Effect from '../effects/Effect'
import GameTime from '../GameTime'

export function runEffectIn (effect: Effect, timeFromNow: number) {
  if (effect.tick) {
    game.effectsAtTime.add(effect, game.time.current + timeFromNow)
  }
}

function tick (elapsedGameTime = 0) {
  game.time.current += elapsedGameTime

  while (game.time.current >= game.effectsAtTime.peekPriority()) {
    const effect = game.effectsAtTime.pop()
    // effect may have been deactivated since it was added to the queue
    if (effect.isActive) {
      effect.tick!()
    }
  }

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

