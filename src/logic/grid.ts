import Entity from '../Entity.ts'
import { hash2D, permutations, randomElement } from '../util/util.ts'
import { putInside } from './container'
import { canReach } from './gridPathFinding.ts'

export function getCell (container: Entity, x: number, y: number) {
  return container.grid?.get(hash2D(x, y))
}

export function addCell (
    world: Entity, zone: Entity, x: number, y: number) {
  putInside(zone, world)

  if (!world.grid) {
    world.grid = new Map()
  }

  world.grid.set(hash2D(x, y), zone)

  zone.position = { x, y }

  world.emit('gridChanged')
}

export function removeCell (zone: Entity) {
  if (!zone.position) return

  const world = zone.parent
  world.grid!.delete(hash2D(zone.position.x, zone.position.y))
  zone.position = undefined
  world.emit('gridChanged')
}

const directionPermutations = permutations([
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
])

export function getDirections () {
  return randomElement(directionPermutations)
}

export function getNeighbors<T> (
    zone: Entity, fn: (cell: Entity) => void | T) {
  if (!zone.position) return

  for (const { dx, dy } of getDirections()) {
    const neighbor = getCell(zone.parent,
        zone.position.x + dx,
        zone.position.y + dy)

    if (!neighbor) continue

    const output = fn(neighbor)
    if (output) {
      return output
    }
  }
}

export function getEmptyNeighbors<T> (
    zone: Entity,
    fn: (position: { x: number, y: number }) => void | T) {
  if (!zone.position) return

  for (const { dx, dy } of getDirections()) {
    const position = {
      x: zone.position!.x + dx,
      y: zone.position!.y + dy,
    }
    const cell = getCell(zone.parent, position.x, position.y)

    if (cell) continue
    const output = fn(position)
    if (output) {
      return output
    }
  }
}

export function canDeleteWithoutSeparating (zone: Entity) {
  if (!zone.position) return false

  const neighbors: Entity[] = []
  getNeighbors(zone, (neighbor) => {
    neighbors.push(neighbor)
  })

  if (neighbors.length === 0) return false
  if (neighbors.length === 1) return true

  zone.parent.grid!.delete(hash2D(zone.position.x, zone.position.y))

  let isValid = true

  for (let i = 1; i < neighbors.length; i++) {
    if (!canReach(neighbors[i - 1], neighbors[i])) {
      isValid = false
      break
    }
  }

  zone.parent.grid!.set(hash2D(zone.position!.x, zone.position!.y),
      zone)

  return isValid
}

