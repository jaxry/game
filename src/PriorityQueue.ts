import { swap } from './util'

// implemented as a binary heap
export default class PriorityQueue<T> {
  private elements: T[] = []
  private costs: number[] = []

  get length () {
    return this.elements.length
  }

  set (element: T, cost: number) {
    this.elements.push(element)
    this.costs.push(cost)

    let i = this.elements.length - 1

    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      const parentCost = this.costs[parent]
      if (cost < parentCost) {
        swap(this.elements, i, parent)
        swap(this.costs, i, parent)
        i = parent
      } else {
        return
      }
    }
  }

  get (): T {
    if (this.elements.length === 1) {
      this.costs.pop()
      return this.elements.pop()!
    }

    const head = this.elements[0]

    this.elements[0] = this.elements.pop()!
    this.costs[0] = this.costs.pop()!

    let i = 0

    while (true) {
      const left = 2 * i + 1
      const right = 2 * i + 2

      let smallest = i
      if (left < this.elements.length &&
          this.costs[left] < this.costs[smallest]) {
        smallest = left
      }
      if (right < this.elements.length &&
          this.costs[right] < this.costs[smallest]) {
        smallest = right
      }

      if (smallest !== i) {
        swap(this.elements, i, smallest)
        swap(this.costs, i, smallest)
        i = smallest
      } else {
        return head
      }
    }
  }

  clear () {
    this.elements.length = 0
    this.costs.length = 0
  }
}