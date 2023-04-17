import Action from '../../../behavior/Action'
import GameObject from '../../../GameObject'

export function* attractableObjects (action: Action) {
  if (!action.target) {
    return
  }

  const container = action.object.container

  // Find the target's ancestor that is a direct child of the container
  function findDirectChild (item: GameObject) {
    while (item.container) {
      if (item.container === container) {
        // Don't include if the action target and action object are the same
        return item !== action.object ? item : undefined
      } else {
        item = item.container
      }
    }
  }

  if (Array.isArray(action.target)) {
    for (const target of action.target) {
      const item = findDirectChild(target)
      if (item) {
        yield item
      }
    }
  } else {
    const item = findDirectChild(action.target)
    if (item) {
      yield item
    }
  }
}