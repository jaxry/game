import TravelAction from '../actions/Travel'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import { activatePlayerAction } from './core'
import { isAncestor } from './container'
import { isDestroyed } from './destroy'
import MoveSpotAction from '../actions/MoveSpot'

export function isPlayer(object: GameObject) {
  return object === game.player
}
export function inPlayerBubble(object: GameObject) {
  return isAncestor(game.player.container, object)
}

export function isSelectable(obj: GameObject) {
  return inPlayerBubble(obj) && !isDestroyed(obj)
}

export function playerTravelToZone(zone: GameObject) {
  const playerZone = game.player.container

  for (const neighbor of playerZone.connections) {
    if (neighbor == zone) {
      activatePlayerAction(new TravelAction(game.player, neighbor))
    }
  }
}

export function playerMoveToSpot(spot: number) {
  activatePlayerAction(new MoveSpotAction(game.player, spot))
}