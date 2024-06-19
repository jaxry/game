export default class Reactive<T> {
  private value: T
  private observers: Set<(value: T) => void> = new Set()

  constructor (initial?: T) {
    this.value = initial as any
  }

  set (v: T) {
    this.value = v
    for (const observer of this.observers) {
      observer(v)
    }
    return v
  }

  get () {
    return this.value
  }

  on (observer: (value: T) => void) {
    this.observers.add(observer)
    observer(this.value)
    return () => this.observers.delete(observer)
  }
}