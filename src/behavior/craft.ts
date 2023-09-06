import GameObject from '../GameObject'
import { spawn } from './spawn'
import { destroy } from './destroy'
import { transferEnergyTo } from './energy'

export function disassemble (object: GameObject) {
  if (!object.type.composedOf) return

  const energyPerPart = Math.floor(
      object.energy / object.type.composedOf.length)

  for (const type of object.type.composedOf) {
    const part = spawn(type, object.container)
    transferEnergyTo(part, object, energyPerPart)
  }

  destroy(object)
}