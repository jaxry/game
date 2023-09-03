import GameObject from '../GameObject'
import { spawn } from './spawn'
import { destroy } from './destroy'

export function disassemble (object: GameObject) {
  if (!object.type.composedOf) return

  for (const [type, quantity] of object.type.composedOf) {
    for (let i = 0; i < quantity; i++) {
      spawn(type, object.container)
    }
  }

  destroy(object)
}