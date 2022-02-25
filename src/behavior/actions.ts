import AttackAction from '../actions/Attack'
import WaitAction from '../actions/Wait'
import type { GameObject } from '../GameObject'
import type { Action } from './Action'

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