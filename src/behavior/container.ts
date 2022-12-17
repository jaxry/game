import type { GameObject } from '../GameObject'
import { ContainedAs } from '../GameObject'

export function moveTo (
    container: GameObject, object: GameObject, containedAs: ContainedAs,
    spot?: number) {
  if (!container.contains) {
    console.warn(container, `is not a container`)
    return
  }

  const from = object.container

  removeFromContainer(object)

  object.container = container
  object.containedAs = containedAs

  if (container.numSpots) {
    object.spot = spot ?? Math.floor(Math.random() * container.numSpots)
  }

  container.contains.add(object)

  // object.emit('move', { to: container, from })
  from?.emit('leave', { item: object, to: container })
  container.emit('enter', { item: object, from })
}

export function wearOnContainer (container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.wearing)
}

export function putInsideContainer (
    container: GameObject, item: GameObject, spot?: number) {
  moveTo(container, item, ContainedAs.inside, spot)
}

export function moveToSpot (item: GameObject, spot: number) {
  const from = item.spot
  item.spot = spot
  item.container.emit('moveSpot', { item, from, to: spot })
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