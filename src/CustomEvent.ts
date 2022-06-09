export default class CustomEvent<T> {
  private listeners: Set<(data: T) => void> = new Set()

  on (listener: (data: T) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  emit (data: T) {
    for (const listener of this.listeners) {
      listener(data)
    }
  }
}