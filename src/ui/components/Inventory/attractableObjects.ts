import Action from '../../../actions/Action'
import GameObject from '../../../GameObject'
import { castArray } from '../../../util'

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

  for (const target of castArray(action.target)) {
    const item = findDirectChild(target)
    if (item) {
      yield item
    }
  }
}