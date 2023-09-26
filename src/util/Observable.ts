export default class Observable<T = void> {
  private observers: Set<(data: T) => void> = new Set()

  on (observer: (data: T) => void) {
    this.observers.add(observer)
    return () => this.observers.delete(observer)
  }

  emit (data: T) {
    for (const observer of this.observers) {
      observer(data)
    }
  }
}