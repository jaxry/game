import TravelAction from '../actions/Travel'
import { game } from '../Game'
import type GameObject from '../GameObject'
import Eat from '../actions/Eat'
import Effect from '../effects/Effect'
import Hold from '../actions/Hold'
import Drop from '../actions/Drop'
import PutInside from '../actions/PutInside'
import { isNeighbor } from './connections'

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

  if (isNeighbor(player.container, zone)) {
    setPlayerEffect(new TravelAction(player, zone))
  }
}

export function getPlayerActions (target: GameObject) {
  const actions = [
    new Eat(game.player, target),
    new Hold(game.player, target),
    new Drop(game.player, target),
    new PutInside(game.player, target),
  ]
  return actions.filter(action => action.condition())
}


