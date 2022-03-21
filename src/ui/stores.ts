import { writable } from 'svelte/store'
import { game as gameInstance } from '../Game'
import type { GameObject } from '../GameObject'
import { isSelectable } from '../behavior/player'
import useDragAndDrop from './useDragAndDrop'
import { crossfade, fade } from 'svelte/transition'
import type AttackAction from '../actions/Attack'
import { deleteElem } from '../util'

export const game = writable(gameInstance)

export const selectedObject = writable<GameObject | null>(null)

export const dragAndDropGameObject = useDragAndDrop<GameObject>()

export const gameObjectToCard = new Map<GameObject, HTMLElement>()

export const attackAnimations = (() => {
  const store = writable<AttackAction[]>([])
  return {
    ...store,
    add(x: AttackAction) {
      store.update(arr => {
        arr.push(x)
        return arr
      })

      setTimeout(() => store.update(arr => {
        deleteElem(arr, x)
        return arr
      }), 2000)
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

