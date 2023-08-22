import type GameObject from '../GameObject'
import { ContainedAs } from '../GameObject'
import { reduce } from '../util'

function moveTo (
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

export function putInsideContainer (container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.inside)
}

export function holdItem (container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.holding)
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
    } else if (item.container === ancestor.container) {
      return false
    }
    item = item.container
  } while (item)

  return false
}

export function isContainedWith (object: GameObject, neighbor: GameObject) {
  return isAncestor(object.container, neighbor)
}

export function* childrenOfType (object: GameObject, type: ContainedAs) {
  for (const child of object.contains) {
    if (child.containedAs === type) {
      yield child
    }
  }
}

export function numberOfChildren (object: GameObject, type: ContainedAs) {
  return reduce(object.contains, (count, item) => {
    return item.containedAs === type ? count + 1 : count
  }, 0)
}