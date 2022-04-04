import { deleteElem } from './util'

export default class CustomEvent<T> {
  private listeners: Array<(data: T) => void> = []

  on(listener: (data: T) => void) {
    this.listeners.push(listener)
    return () => {
      deleteElem(this.listeners, listener)
    }
  }

  emit(data: T) {
    for (const listener of this.listeners) {
      listener(data)
    }
  }
}