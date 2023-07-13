export default class Observable<T = void> {
  private listeners: Set<(data: T) => void | boolean> = new Set()

  on (listener: (data: T) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  emit (data: T) {
    let bubble = true
    for (const listener of this.listeners) {
      bubble = (listener(data) ?? true) && bubble
    }
    return bubble
  }
}