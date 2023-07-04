import Action from '../../../actions/Action'
import GameObject from '../../../GameObject'
import { castArray, mapFilter } from '../../../util'

export function attractableObjects (action: Action) {
  if (!action.target) {
    return []
  }

  const container = action.object.container

  // Find the target's ancestor that is a direct child of the container
  function findChildOfContainer (object: GameObject) {
    while (object.container) {
      if (object.container === container) {
        // Don't include if the action target and action object are the same
        return object !== action.object ? object : undefined
      } else {
        object = object.container
      }
    }
  }

  return mapFilter(castArray(action.target), findChildOfContainer)
}