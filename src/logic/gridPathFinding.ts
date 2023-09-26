import Entity from '../Entity.ts'
import PriorityQueue from '../util/PriorityQueue.ts'
import { getCell, getDirections } from './grid.ts'

const costs = new Map<Entity, number>()
const cameFrom = new Map<Entity, Entity>()
const queue = new PriorityQueue<Entity>()

function cleanupPathfinding () {
  costs.clear()
  cameFrom.clear()
  queue.clear()
}

export function pathFind (start: Entity, destination: Entity) {
  if (start.parent !== destination.parent || !start.position ||
      !destination.position) {
    return []
  }

  costs.set(start, 0)
  cameFrom.set(start, start)
  queue.add(start, 0)

  while (queue.length > 0) {
    const entity = queue.pop()

    if (entity === destination) {
      const path = reconstructPath(start, destination, cameFrom)
      cleanupPathfinding()
      return path
    }

    const cost = costs.get(entity)!

    for (const { dx, dy } of getDirections()) {
      const neighbor = getCell(entity.parent,
          entity.position!.x + dx,
          entity.position!.y + dy)
      if (!neighbor) continue

      const neighborCost = costs.get(neighbor)
      const newCost = cost + 1
      if (!neighborCost || neighborCost > newCost) {
        cameFrom.set(neighbor, entity)
        costs.set(neighbor, newCost)
        queue.add(neighbor, newCost + cellDistance(neighbor, destination))
      }
    }
  }

  cleanupPathfinding()
  return []
}

export function canReach (start: Entity, destination: Entity) {
  if (start.parent !== destination.parent || !start.position ||
      !destination.position) {
    return false
  }

  costs.set(start, 0)
  queue.add(start, 0)

  while (queue.length > 0) {
    const entity = queue.pop()

    if (entity === destination) {
      cleanupPathfinding()
      return true
    }

    const cost = costs.get(entity)!

    for (const { dx, dy } of getDirections()) {
      const neighbor = getCell(entity.parent,
          entity.position!.x + dx,
          entity.position!.y + dy)
      if (!neighbor) continue

      const neighborCost = costs.get(neighbor)
      const newCost = cost + 1
      if (!neighborCost || neighborCost > newCost) {
        costs.set(neighbor, newCost)
        queue.add(neighbor, newCost + cellDistance(neighbor, destination))
      }
    }
  }

  cleanupPathfinding()
  return false
}

function reconstructPath (
    source: Entity, destination: Entity,
    cameFrom: Map<Entity, Entity>) {
  const path: Entity[] = []
  let current = destination

  while (current !== source) {
    path.push(current)
    current = cameFrom.get(current)!
  }

  return path
}

export function cellDistance (a: Entity, b: Entity) {
  const dx = a.position!.x - b.position!.x
  const dy = a.position!.y - b.position!.y
  return Math.abs(dx) + Math.abs(dy)
}