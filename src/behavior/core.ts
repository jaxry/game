import { game } from '../Game'
import { destroyMarked } from './destroy'
import Effect, { effectsCallback, iterateQueuedEffects } from './Effect'

let tickInProgress = false

function tick () {
  iterateQueuedEffects(addEffectToGameLoop)

  game.time.current += 1

  tickInProgress = true
  for (const set of game.effectsWithTick) {
    for (const effect of set) {
      effect.tick!()
    }
  }
  tickInProgress = false

  game.energyPool += destroyMarked()
}

let timeout: number | null = null
let playerEffect: Effect | null = null

export function interruptPlayerLoop () {
  clearTimeout(timeout!)
  timeout = null
}

export function startGameLoop () {
  if (!timeout) {
    timeout = setTimeout(playerTick, 1000)
  }
}

export function startPlayerEffect (effect: Effect) {
  playerEffect?.deactivate()
  playerEffect = effect
  playerEffect.activate()
}

export function isTickInProgress () {
  return tickInProgress
}

function playerTick () {
  tick()
  game.event.playerTickEnd.emit(undefined)
  timeout = setTimeout(playerTick, 1000)
}

function addEffectToGameLoop (effect: Effect) {
  game.effectsWithTick[effect.tickPriority].add(effect)
}

effectsCallback.removeEffectFromGameLoop = (effect: Effect) => {
  return game.effectsWithTick[effect.tickPriority].delete(effect)
}
