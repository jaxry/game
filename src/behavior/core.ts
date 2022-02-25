import { game } from '../Game'
import type { Action } from './Action'
import { destroyMarked } from './destroy'
import { addEffectsToGameLoop, Effect, effectsCallback } from './Effect'

export function tick() {
  addEffectsToGameLoop(addQueuedEffects)

  game.time.current += 1

  for (const effect of game.effectsWithTick) {
    effect.tick!()
  }

  game.energyPool += destroyMarked()
}

let timeout: NodeJS.Timeout | null = null
let time: number
let minTime = 17
let lastLogSize = 0
let ticksPerFrame = 0

export function startPlayerAction(action?: Action) {
  game.log.start()

  if (action) {
    action.activate()

    lastLogSize = game.log.size

    const idealTime = 2000 / (1 + action.time)
    ticksPerFrame = Math.max(1, Math.ceil(minTime / idealTime))
    time = Math.max(minTime, idealTime)
  }

  if (!timeout) {
    playerTick()
  }
}

function playerTick() {
  let continueNextTick = true

  for (let i = 0; i < ticksPerFrame && continueNextTick; i++) {
    tick()
    continueNextTick = game.player.activeAction &&
        (!game.player.activeAction.interruptable || !game.log.important)
  }

  game.event.playerTick.emit(undefined)

  let thisTime = time
  if (game.log.size > lastLogSize) {
    thisTime = 500
  }
  lastLogSize = game.log.size

  if (continueNextTick) {
    timeout = setTimeout(playerTick, thisTime)
  } else {
    game.log.finish()
    timeout = null
  }
}

function addQueuedEffects(effects: Effect[]) {
  for (const effect of effects) {
    game.effectsWithTick.add(effect)
  }
}

effectsCallback.removeEffectFromGameLoop = (effect: Effect) => {
  return game.effectsWithTick.delete(effect)
}
