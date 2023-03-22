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

  removeFromContainer(object)

  object.container = container
  object.containedAs = containedAs
  object.position.x = 200 * (Math.random() - 0.5)
  object.position.y = 200 * (Math.random() - 0.5)

  container.contains.add(object)

  from?.emit('leave', { item: object, to: container })
  container.emit('enter', { item: object, from })
}

export function wearOnContainer (container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.wearing)
}

export function putInsideContainer (container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.inside)
}

export function removeFromContainer (item: GameObject) {
  if (item.container) {
    item.container.contains.delete(item)
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