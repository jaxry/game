import { game } from '../Game'
import GameObject from '../GameObject'

export function takeEnergyFromWorld (amount: number) {
  amount = Math.min(game.energyPool, amount)
  game.energyPool -= amount
  return amount
}

export function takeEnergyFromObject (object: GameObject, amount: number) {
  amount = Math.min(object.energy ?? 0, amount)
  object.energy -= amount
  return amount
}