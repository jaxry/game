import Entity from './Entity.ts'

export class NamedEntity {
  constructor (public entity: Entity, public name: string) {

  }
}

export type LogEntry = (string | Entity | NamedEntity)[]

export const directionNames = [
  'west', 'north-west', 'north', 'north-east',
  'east', 'south-east', 'south', 'south-west',
]

export function directionName (from: Entity, to: Entity) {
  if (!from.position || !to.position) return ''
  const dx = to.position.x - from.position.x
  const dy = to.position.y - from.position.y
  return angleToDirectionName(dx, dy)
}

export function angleToDirectionName (x: number, y: number) {
  const angle = -0.5 * Math.atan2(y, x) / Math.PI + 0.5
  const l = directionNames.length
  const index = Math.round(angle * l) % l
  return directionNames[index]
}