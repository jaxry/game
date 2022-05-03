import { game } from '../Game'
import type Action from './Action'
import { destroyMarked } from './destroy'
import { addQueuedEffectsToGameLoop, Effect, effectsCallback } from './Effect'

export function tick() {
  addQueuedEffectsToGameLoop(addEffectToGameLoop)

  game.time.current += 1

  for (const set of game.effectsWithTick) {
    for (const effect of set) {
      effect.tick!()
    }
  }

  game.energyPool += destroyMarked()
}

let timeout: number | null = null
let playerBehavior: Effect | null = null

export function interruptPlayerLoop() {
  clearTimeout(timeout!)
  timeout = null
}

export function startGameLoop() {
  if (!timeout) {
    timeout = setTimeout(playerTick, 1000)
  }
}

export function startPlayerBehavior(effect: Effect) {
  playerBehavior?.deactivate()
  playerBehavior = effect
  playerBehavior.activate()
}

function playerTick() {
  game.event.playerTickStart.emit(undefined)
  tick()
  game.event.playerTickEnd.emit(undefined)
  timeout = setTimeout(playerTick, 1000)
}

function addEffectToGameLoop(effect: Effect) {
  game.effectsWithTick[effect.tickPriority].add(effect)
}

effectsCallback.removeEffectFromGameLoop = (effect: Effect) => {
  return game.effectsWithTick[effect.tickPriority].delete(effect)
}
