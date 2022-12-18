import TravelAction from '../actions/Travel'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import type Action from './Action'
import { setPlayerEffect } from './core'
import { isContainedWith } from './container'
import { isDestroyed } from './destroy'
import MoveSpotAction from '../actions/MoveSpot'
import AttackAction from '../actions/Attack'
import WaitAction from '../actions/Wait'
import { Effect } from './Effect'
import { serializable } from '../serialize'

export function changePlayer (object: GameObject) {
  game.player = object
  game.event.playerChange.emit(object)
}

export function isPlayer (object: GameObject) {
  return object === game.player
}

export function inPlayerBubble (object: GameObject) {
  return isContainedWith(game.player, object)
}

export function isSelectable (obj: GameObject) {
  return inPlayerBubble(obj) && !isDestroyed(obj)
}

export function playerTravelToZone (zone: GameObject) {
  const playerZone = game.player.container

  for (const neighbor of playerZone.connections) {
    if (neighbor == zone) {
      setPlayerEffect(new TravelAction(game.player, neighbor))
    }
  }
}

export function getPlayerInteractions (player: GameObject) {
  return [
    new WaitAction(player),
  ]
}

export function getObjectInteractions (
    player: GameObject, subject: GameObject) {
  const actions: Action[] = [
    new AttackAction(player, subject),
  ].filter(action => action.condition())

  return actions
}

export class MovePlayerToSpot extends Effect {
  constructor (object: GameObject, public spot: number) {
    super(object)
  }

  move () {
    if (this.object.spot !== this.spot) {
      new MoveSpotAction(this.object, this.spot).activate()
    }
  }

  override tick () {
    if (this.object.spot === this.spot) {
      this.deactivate()
    } else if (!this.object.activeAction) {
      this.move()
    }
  }

  override onActivate () {
    this.move()
  }
}

serializable(MovePlayerToSpot)
