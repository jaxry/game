import { writable } from 'svelte/store'
import { game as gameInstance } from '../Game'
import type { GameObject } from '../GameObject'
import { isSelectable } from '../behavior/player'
import useDragAndDrop from './useDragAndDrop'
import { crossfade, fade } from 'svelte/transition'

export const game = writable(gameInstance)

export const selectedObject = writable<GameObject | null>(null)

export const dragAndDropGameObject = useDragAndDrop<GameObject>()

export const [gameObjectSend, gameObjectReceive] = crossfade({
  fallback: fade,
  duration: 200,
})

export function rerenderGame() {
  game.update(x => x)
  selectedObject.update(x => x && isSelectable(x) ? x : null)
}

export function setSelectedObject(object: GameObject | null) {
  if (object === null || isSelectable(object)) {
    selectedObject.set(object)
  }
}

