import { derived, get, writable } from 'svelte/store'

type DropEffect = 'copy' | 'move' | 'link'

export default function useDragAndDrop<T>() {
  const payloadStore = writable<T | null>(null)

  function drag(node: HTMLElement, payload: T) {
    node.draggable = true
    node.addEventListener('dragstart', (e) => {
      payloadStore.set(payload)
      e.dataTransfer!.setData('text/plain', (e.target as HTMLElement).innerText)
    })
    node.addEventListener('dragend', () => {
      payloadStore.set(null)
    })

    return {
      update(_payload: T) {
        payload = _payload
      },
    }
  }

  function drop(
      canDrop: (object: T) => DropEffect | void,
      onDrop: (object: T, e: DragEvent) => void,
  ) {

    function dropAction(node: HTMLElement) {
      let returnedEffect: DropEffect | void

      node.addEventListener('dragenter', (e) => {
        const payload = get(payloadStore)
        if (payload) {
          // TODO: use isDroppable instead of canDrop
          returnedEffect = canDrop(payload)
          e.stopPropagation()
          e.preventDefault()
        }
      })

      node.addEventListener('dragover', (e) => {
        if (!get(payloadStore) || !returnedEffect) {
          return
        }
        e.dataTransfer!.dropEffect = returnedEffect
        e.preventDefault()
        e.stopPropagation()
      })

      node.addEventListener('drop', (e) => {
        onDrop(get(payloadStore)!, e)
        e.preventDefault()
        e.stopPropagation()
      })
    }

    const isDroppable = derived(payloadStore, (payload) => {
      return payload && canDrop(payload)
    })

    return {dropAction, isDroppable}
  }

  return {
    drag,
    drop,
  }
}