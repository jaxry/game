import { writable } from 'svelte/store'
import { game as gameInstance } from '../Game'
import type { GameObject } from '../GameObject'
import { isSelectable } from '../behavior/player'
import useDragAndDrop from './useDragAndDrop'

export const game = writable(gameInstance)

export const elements: {
  main: HTMLElement,
} = {} as any

export const selectedObject = writable<GameObject | null>(null)

export const dragAndDropGameObject = useDragAndDrop<GameObject>()

export function rerenderGame() {
  game.update(x => x)
  selectedObject.update(x => x && isSelectable(x) ? x : null)
}

export function setSelectedObject(object: GameObject | null) {
  if (object === null || isSelectable(object)) {
    selectedObject.set(object)
  }
}