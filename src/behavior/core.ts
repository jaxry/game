import { game } from '../Game'
import { destroyMarked } from './destroy'
import Effect from './Effect'
import GameTime from '../GameTime'
import { Timer } from '../Timer'

export function runEffectIn (effect: Effect, timeFromNow: number) {
  game.effectsAtTime.add(effect, game.time.current + timeFromNow)
}

function tick (elapsedGameTime = 0) {
  game.time.current += elapsedGameTime

  while (game.time.current >= game.effectsAtTime.peekPriority()) {
    const effect = game.effectsAtTime.pop()
    effect.run?.()
  }

  game.energyPool += destroyMarked()

}

let timer: Timer | null = null

export function startGameLoop () {
  const nextTime = game.effectsAtTime.peekPriority()
  if (nextTime) {
    const duration = Math.max(16,
        (nextTime - game.time.current) * GameTime.millisecond)
    timer = new Timer(() => {
      tick(duration / GameTime.millisecond)
      startGameLoop()
    }, duration)
  } else {
    timer = null
  }
}

export function resumeGameLoop () {
  timer?.resume()
}

export function pauseGameLoop () {
  timer?.pause()
}

let playerEffect: Effect | null = null

export function setPlayerEffect (effect: Effect) {
  timer?.stop()
  playerEffect?.deactivate()
  playerEffect = effect
  playerEffect.activate()
  startGameLoop()
}

