import { game } from '../Game'
import type { Action } from './Action'
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

let timeout: NodeJS.Timeout | null = null
let timeoutTime: number
let lastActionTime = 0
let ticksPerFrame = 0

export function startPlayerAction(action?: Action) {
  game.log.start()
  game.objectLog.clear()

  if (action) {
    action.activate()
    computeFrameTime(action)
  } else {
    ticksPerFrame = 1
  }

  if (!timeout) {
    playerTick()
  }
}

function computeFrameTime(action: Action) {
  const minTimeoutTime = 17
  const idealTimeoutTime = Math.min(250, 1000 / action.time)
  ticksPerFrame = Math.max(1, Math.ceil(minTimeoutTime / idealTimeoutTime))
  timeoutTime = Math.max(minTimeoutTime, idealTimeoutTime)
  lastActionTime = action.time
}

function playerTick() {

  let continueNextTick = true

  for (let i = 0; i < ticksPerFrame && continueNextTick; i++) {
    tick()
    continueNextTick = game.player.activeAction
        && (!game.player.activeAction.canInterrupt || !game.log.important)
  }

  game.event.playerTick.emit(undefined)

  if (continueNextTick) {
    if (game.player.activeAction.time !== lastActionTime - ticksPerFrame) {
      computeFrameTime(game.player.activeAction)
    }
    lastActionTime = game.player.activeAction.time

    timeout = setTimeout(playerTick, timeoutTime)
  } else {
    game.log.finish()
    timeout = null
  }
}

function addEffectToGameLoop(effect: Effect) {
  game.effectsWithTick[effect.tickPriority].add(effect)
}

effectsCallback.removeEffectFromGameLoop = (effect: Effect) => {
  return game.effectsWithTick[effect.tickPriority].delete(effect)
}
