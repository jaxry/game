import { writable } from 'svelte/store'
import { game as gameInstance } from '../Game'
import type { GameObject } from '../GameObject'
import { isSelectable } from '../behavior/player'
import useDragAndDrop from './useDragAndDrop'
import { deleteElem } from '../util'
import useContext from './useContext'
import type Action from '../behavior/Action'

export const game = writable(gameInstance)

export const mainElementContext = useContext<HTMLElement>()

export const selectedObject = writable<GameObject | null>(null)

export const dragAndDropGameObject = useDragAndDrop<GameObject>()

export const gameObjectToCard = new Map<GameObject, HTMLElement>()

export const targetActionDuration = 1000

export let delayAnim = false

export function zoneObjectDelay() {
  return delayAnim ? targetActionDuration : 0
}

export const targetActions = (() => {
  const store = writable<Action[]>([])
  return {
    ...store,
    add(action: Action) {

      store.update(list => {
        list.push(action)
        return list
      })

      setTimeout(() => store.update(list => {
        deleteElem(list, action)
        delayAnim = false
        return list
      }), targetActionDuration)

      delayAnim = true
    }
  }
})()

export function rerenderGame() {
  game.update(x => x)
  selectedObject.update(x => x && isSelectable(x) ? x : null)
}

export function setSelectedObject(object: GameObject | null) {
  if (object === null || isSelectable(object)) {
    selectedObject.set(object)
  }
}

