import TravelAction from '../actions/Travel'
import { game } from '../Game'
import type GameObject from '../GameObject'
import { setPlayerEffect } from './gameLoop'
import Eat from '../actions/Eat'

export function changePlayer (object: GameObject) {
  game.player = object
  game.event.playerChange.emit(object)
}

export function isPlayer (object: GameObject) {
  return object === game.player
}

export function playerTravelToZone (zone: GameObject) {
  const playerZone = game.player.container

  for (const neighbor of playerZone.connections) {
    if (neighbor == zone) {
      setPlayerEffect(new TravelAction(game.player, neighbor))
    }
  }
}

export function getPlayerActions (object: GameObject) {
  const actions = []
  if (object.energy) {
    actions.push(new Eat(game.player, object))
  }
  return actions
}
