import type Entity from '../Entity.ts'
import { removeCell } from './grid.ts'
import { addIndexedElement, deleteIndexedElement } from '../util/util.ts'

export function putInside (entity: Entity, parent: Entity) {
  if (entity.parent === parent) return

  if (!parent.children) {
    parent.children = []
  }

  const from = entity.parent

  removeFrom(entity, parent)

  entity.parent = parent

  addIndexedElement(parent.children, entity)

  entity.emit('enter', from)
}

export function removeFrom (entity: Entity, destination?: Entity) {
  if (!entity.parent) return

  removeCell(entity)

  deleteIndexedElement(entity.parent.children!, entity)

  entity.emit('leave', destination)

  entity.parent = undefined as any
}

export function isAncestor (ancestor: Entity, entity: Entity) {
  do {
    if (entity === ancestor) return true

    if (entity.parent === ancestor.parent) return false

    entity = entity.parent
  } while (entity)

  return false
}

export function numberOfChildren (entity: Entity) {
  return entity.children?.length ?? 0
}

export function entityChildren<T> (
    entity: Entity, fn: (child: Entity) => void | T) {
  if (!entity.children) {
    return
  }
  // reverse iteration so entities can be added and deleted during loop
  for (let i = entity.children.length - 1; i >= 0; i--) {
    const output = fn(entity.children[i])
    if (output) {
      return output
    }
  }
}