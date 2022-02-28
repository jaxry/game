import type { GameObject } from '../GameObject'
import { ContainedAs } from '../GameObjectType'
import { deleteElem } from '../util'

export function moveTo(
    container: GameObject, object: GameObject, containedAs: ContainedAs) {
  if (!container.contains) {
    console.warn(container, `is not a container`)
    return
  }

  const from = object.container

  removeFromContainer(object)

  object.container = container
  object.containedAs = containedAs
  object.spot = Math.floor(Math.random() * 5)

  container.contains.push(object)

  container.emit('receive', {receiving: object, from})
  object.emit('move', {to: container, from})
}

export function wearOnContainer(container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.wearing)
}

export function putInsideContainer(container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.inside)
}

export function removeFromContainer(item: GameObject) {
  if (item.container) {
    deleteElem(item.container.contains, item)
  }
}

export function isAncestor(ancestor: GameObject, item: GameObject) {
  do {
    if (item === ancestor) {
      return true
    }
    item = item.container
  } while (item)

  return false
}

export function isContainedWith(object: GameObject, neighbor: GameObject) {
  return object.container === neighbor.container
}