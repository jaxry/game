import { game } from '../Game'
import GameObject from '../GameObject'

export function takeEnergyFromObject (object: GameObject, amount: number) {
  if (!object.energy) {
    return 0
  }
  amount = Math.min(object.energy, amount)
  object.energy -= amount
  return amount
}

export function giveEnergyToObject (object: GameObject, amount: number) {
  object.energy += amount
}

export function takeEnergyFromWorld (amount: number) {
  return takeEnergyFromObject(game.world, amount)
}

export function giveEnergyToWorld (amount: number) {
  giveEnergyToObject(game.world, amount)
}

export function getWorldEnergy () {
  return game.world.energy
}