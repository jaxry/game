import TravelAction from '../actions/Travel'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import type Action from './Action'
import { setPlayerAction } from './core'
import { isContainedWith } from './container'
import { isDestroyed } from './destroy'
import MoveSpotAction from '../actions/MoveSpot'
import AttackAction from '../actions/Attack'
import WaitAction from '../actions/Wait'

export function isPlayer(object: GameObject) {
  return object === game.player
}

export function inPlayerBubble(object: GameObject) {
  return isContainedWith(game.player, object)
}

export function isSelectable(obj: GameObject) {
  return inPlayerBubble(obj) && !isDestroyed(obj)
}

export function playerTravelToZone(zone: GameObject) {
  const playerZone = game.player.container

  for (const neighbor of playerZone.connections) {
    if (neighbor == zone) {
      setPlayerAction(new TravelAction(game.player, neighbor))
    }
  }
}

export function playerMoveToSpot(spot: number) {
  setPlayerAction(new MoveSpotAction(game.player, spot))
}

export function getPlayerInteractions(player: GameObject) {
  return [
    new WaitAction(player),
  ]
}

export function getObjectInteractions(player: GameObject, subject: GameObject) {
  const actions: Action[] = [
    new AttackAction(player, subject),
  ].filter(action => action.condition())

  return actions
}
