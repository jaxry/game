import { swap } from './util'

// implemented as a binary heap
// returns elements with the lowest priority first
export default class PriorityQueue<T> {
  private elements: T[] = []
  private priority: number[] = []

  get length () {
    return this.elements.length
  }

  add (element: T, priority: number) {
    this.elements.push(element)
    this.priority.push(priority)

    let i = this.elements.length - 1

    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      const parentPriority = this.priority[parent]
      if (priority < parentPriority) {
        swap(this.elements, i, parent)
        swap(this.priority, i, parent)
        i = parent
      } else {
        return
      }
    }
  }

  pop (): T {
    if (this.elements.length === 1) {
      this.priority.pop()
      return this.elements.pop()!
    }

    const head = this.elements[0]

    this.elements[0] = this.elements.pop()!
    this.priority[0] = this.priority.pop()!

    let i = 0

    while (true) {
      const left = 2 * i + 1
      const right = 2 * i + 2

      let smallest = i
      if (left < this.elements.length &&
          this.priority[left] < this.priority[smallest]) {
        smallest = left
      }
      if (right < this.elements.length &&
          this.priority[right] < this.priority[smallest]) {
        smallest = right
      }

      if (smallest !== i) {
        swap(this.elements, i, smallest)
        swap(this.priority, i, smallest)
        i = smallest
      } else {
        return head
      }
    }
  }

  peekElement () {
    return this.elements[0]
  }

  peekPriority () {
    return this.priority[0]
  }

  clear () {
    this.elements.length = 0
    this.priority.length = 0
  }
}