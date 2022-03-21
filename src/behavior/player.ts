import TravelAction from '../actions/Travel'
import { game } from '../Game'
import type { GameObject } from '../GameObject'
import type { Action } from './Action'
import { interruptPlayerLoop, startPlayerAction } from './core'
import { isContainedWith } from './container'
import { isDestroyed } from './destroy'
import MoveSpotAction from '../actions/MoveSpot'
import { Effect } from './Effect'
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
      startPlayerAction(new TravelAction(game.player, neighbor))
    }
  }
}

export function playerMoveToSpot(spot: number) {
  startPlayerAction(new MoveSpotAction(game.player, spot))
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

export const actionMap = new Map<GameObject, Action>()

export class PlayerUI extends Effect {
  override onActivate() {
    this.onEvent(this.object.container, 'enter', ({item}) => {
      console.log(item, 'enter')
    })

    this.onEvent(this.object.container, 'leave', ({item}) => {
      console.log(item, 'leave')
    })

    this.onEvent(this.object.container, 'itemActionStart', ({action}) => {
      if (action.object !== game.player && action instanceof AttackAction) {
        interruptPlayerLoop()
      }
    })

    this.onEvent(this.object.container, 'itemActionFinish', ({action}) => {
      actionMap.set(action.object, action)
      console.log(actionMap)
    })

    this.onEvent(this.object, 'move', () => {
      this.deactivate().activate()
    })
  }
}
