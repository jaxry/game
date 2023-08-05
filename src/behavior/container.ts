import type GameObject from '../GameObject'
import { ContainedAs } from '../GameObject'

export function moveTo (
    container: GameObject, object: GameObject, containedAs: ContainedAs) {

  if (!container.type.isContainer) {
    console.warn(container, ' is not a container')
  }

  if (!container.contains) {
    container.contains = new Set()
  }

  const from = object.container

  object.emit('leave', container)

  removeFromContainer(object)

  object.container = container
  object.containedAs = containedAs

  container.contains.add(object)

  object.emit('enter', from)
}

export function wearOnContainer (container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.wearing)
}

export function putInsideContainer (container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.inside)
}

export function removeFromContainer (object: GameObject) {
  if (object.container) {
    object.container.contains.delete(object)
  }
}

export function isAncestor (ancestor: GameObject, item: GameObject) {
  do {
    if (item === ancestor) {
      return true
    }
    item = item.container
  } while (item)

  return false
}

export function isContainedWith (object: GameObject, neighbor: GameObject) {
  return object.container === neighbor.container
}