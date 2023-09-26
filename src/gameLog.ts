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
  if (!from.gridPosition || !to.gridPosition) return ''
  const dx = to.gridPosition.x - from.gridPosition.x
  const dy = to.gridPosition.y - from.gridPosition.y
  return angleToDirectionName(dx, dy)
}

export function angleToDirectionName (x: number, y: number) {
  const angle = -0.5 * Math.atan2(y, x) / Math.PI + 0.5
  const l = directionNames.length
  const index = Math.round(angle * l) % l
  return directionNames[index]
}