import TravelAction from '../actions/Travel'
import { game } from '../Game'
import type GameObject from '../GameObject'
import Eat from '../actions/Eat'
import Effect from '../effects/Effect'

export function setPlayer (object: GameObject) {
  game.player = object
  game.event.playerChange.emit(object)
  return object
}

export function getPlayer () {
  return game.player
}

export function isPlayer (object: GameObject) {
  return object === game.player
}

let playerEffect: Effect | null = null

export function setPlayerEffect (effect: Effect) {
  playerEffect?.deactivate()
  playerEffect = effect
  playerEffect.activate()
}

export function playerTravelToZone (zone: GameObject) {
  const player = getPlayer()
  const playerZone = player.container

  for (const neighbor of playerZone.connections) {
    if (neighbor == zone) {
      setPlayerEffect(new TravelAction(player, neighbor))
    }
  }
}

export function getPlayerActions (object: GameObject) {
  const actions = [
    new Eat(game.player, object),
  ]
  return actions.filter(action => action.condition())
}


