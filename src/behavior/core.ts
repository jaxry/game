import { game } from '../Game'
import Effect from './Effect'
import GameTime from '../GameTime'

export function runEffectIn (effect: Effect, timeFromNow: number) {
  game.effectsAtTime.add(effect, game.time.current + timeFromNow)
}

function tick (elapsedGameTime = 0) {
  game.time.current += elapsedGameTime

  while (game.time.current >= game.effectsAtTime.peekPriority()) {
    const effect = game.effectsAtTime.pop()
    effect.run?.()
  }

  game.event.tick.emit()
}

let timeout: number | null = null

export function gameLoop () {
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

