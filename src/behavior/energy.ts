import GameObject from '../GameObject'

export function transferEnergyTo (
    to: GameObject, from: GameObject, amount?: number) {

  if (!from.energy) return 0

  amount = amount ? Math.min(from.energy, amount) : from.energy

  from.energy -= amount
  to.energy = (to.energy ?? 0) + amount

  return amount
}