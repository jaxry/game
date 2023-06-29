import type GameObject from '../GameObject'
import { ContainedAs } from '../GameObject'
import { randomCentered } from '../util'

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

  const { x, y } = averageItemPosition(container)
  object.position.x = x + randomCentered()
  object.position.y = y + randomCentered()

  container.contains.add(object)

  object.emit('enter', from)
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

export function averageItemPosition ({ contains }: GameObject) {
  let x = 0
  let y = 0

  for (const item of contains) {
    x += item.position.x
    y += item.position.y
  }

  x /= contains.size || 1
  y /= contains.size || 1

  return { x, y }
}