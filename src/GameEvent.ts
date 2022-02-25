export default class GameEvent<T> {
  private listeners: Array<(data: T) => void> = []

  on(listener: (data: T) => void) {
    this.listeners.push(listener)
  }

  emit(data: T) {
    for (const listener of this.listeners) {
      listener(data)
    }
  }
}