import TravelAction from '../actions/Travel'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import { startPlayerAction } from './core'
import { isAncestor } from './container'
import { isDestroyed } from './destroy'

export function movePlayerToZone(zone: GameObject) {
  const playerZone = game.player.container

  for (const neighbor of playerZone.connections) {
    if (neighbor == zone) {
      startPlayerAction(new TravelAction(game.player, neighbor))
      return true
    }
  }

  return false
}

export function isPlayer(object: GameObject) {
  return object === game.player
}

export function inPlayerBubble(object: GameObject) {
  return isAncestor(game.player.container, object)
}

export function isSelectable(obj: GameObject) {
  return inPlayerBubble(obj) && !isDestroyed(obj)
}