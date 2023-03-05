import { game } from '../Game'
import { destroyMarked } from './destroy'
import Effect from './Effect'
import { deleteElem } from '../util'
import GameTime from '../GameTime'

let tickInProgress = false
let queuedTickEffects: Effect[] = []

function tick () {
  for (const effect of queuedTickEffects) {
    game.effectsWithTick[effect.tickPriority].add(effect)
  }
  queuedTickEffects.length = 0

  game.time.current++

  tickInProgress = true
  for (const set of game.effectsWithTick) {
    for (const effect of set) {
      effect.tick!()
    }
  }
  tickInProgress = false

  game.energyPool += destroyMarked()

  game.event.tick.emit()
}

let timeout: number | null = null

function gameLoop () {
  tick()
  timeout = setTimeout(gameLoop, GameTime.tickTime * 1000)
}

export function addEffectToGameLoop (effect: Effect) {
  queuedTickEffects.push(effect)
}

export function removeEffectFromGameLoop (effect: Effect) {
  const deleted = game.effectsWithTick[effect.tickPriority].delete(effect)
  if (!deleted) {
    deleteElem(queuedTickEffects, effect)
  }
}

export function startGameLoop () {
  if (!timeout) {
    timeout = setTimeout(gameLoop, GameTime.tickTime * 1000)
  }
}

export function pauseGameLoop () {
  clearTimeout(timeout!)
  timeout = null
}

export function isTickInProgress () {
  return tickInProgress
}

let playerEffect: Effect | null = null

export function setPlayerEffect (effect: Effect) {
  playerEffect?.deactivate()
  playerEffect = effect
  playerEffect.activate()
}

