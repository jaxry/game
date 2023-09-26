import { expect, test } from 'vitest'
import PriorityQueue from './PriorityQueue.ts'

const queue = new PriorityQueue<{ x: number }>()
queue.add({ x: 10 }, 10)
queue.add({ x: 11 }, 11)
queue.add({ x: 9 }, 9)
queue.add({ x: 9 }, 9)
queue.add({ x: 8 }, 8)
queue.add({ x: 9 }, 9)
queue.add({ x: 14 }, 14)

test('Min ordered', () => {
  let last = -Infinity
  while (queue.length) {
    const next = queue.pop().x
    expect(next).toBeGreaterThanOrEqual(last)
    last = next
  }
})