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

  object.emit('move', {to: container, from})
  from?.emit('leave', {item: object, to: container})
  container.emit('enter', {item: object, from})
}

export function wearOnContainer(container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.wearing)
}

export function putInsideContainer(container: GameObject, item: GameObject) {
  moveTo(container, item, ContainedAs.inside)
}

export function moveToSpot(item: GameObject, spot: number) {
  const from = item.spot
  item.spot = spot
  item.container.emit('moveSpot', {item, from, to: spot})
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