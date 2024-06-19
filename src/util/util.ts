// ---------------
// Math functions
// ---------------
export function mod (x: number, n: number) {
  return ((x % n) + n) % n
}

export function clamp (min: number, max: number, x: number) {
  return Math.min(max, Math.max(min, x))
}

export function lerp (
  x0: number, x1: number, y0: number, y1: number, x: number) {
  return y0 + (x - x0) * (y1 - y0) / (x1 - x0)
}

export function lerpClamped (
  x0: number, x1: number, y0: number, y1: number, x: number) {
  return clamp(Math.min(y0, y1), Math.max(y0, y1), lerp(x0, x1, y0, y1, x))
}

export function toPrecision (x: number, numDecimals = 0) {
  return Math.round(x * 10 ** numDecimals) / 10 ** numDecimals
}

export function randomNumber (min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function randomInt (min: number, max: number) {
  return Math.floor(randomNumber(min, max + 1))
}

export function noisy (x: number, deviation = 0.5) {
  return x * (1 + deviation * (2 * Math.random() - 1))
}

export function randomSign () {
  return Math.random() < 0.5 ? -1 : 1
}

export function weightedRandom (weights: number[]) {
  const r = Math.random() * weights.reduce((x, s) => x + s)
  let total = 0
  for (let i = 0; i < weights.length; i++) {
    total += weights[i]
    if (r < total) {
      return i
    }
  }
  return 0
}

// Matthew Szudzik's Pairing function for positive and negative integers
export function hash2D (x: number, y: number) {
  const a = x >= 0 ? 2 * x : -2 * x - 1
  const b = y >= 0 ? 2 * y : -2 * y - 1
  return a >= b ? a * a + a + b : b * b + a
}

export function onChange<T = string> (value?: T) {
  return (newValue: T, callback: (oldValue?: T) => void) => {
    if (newValue === value) return
    callback(value)
    value = newValue
  }
}

// ---------------
// array functions
// ---------------
export function makeArray<T> (size: number, map: (i: number) => T): T[] {
  const array = new Array(size)
  for (let i = 0; i < size; i++) {
    array[i] = map(i)
  }
  return array
}

export function castArray<T> (value: T | T[] | undefined) {
  return value === undefined ? [] : Array.isArray(value) ? value : [value]
}

export function randomIndex (array: any[]) {
  return Math.floor(Math.random() * array.length)
}

export function randomElement<T> (array: T[]): T {
  return array[randomIndex(array)]
}

export function shuffle<T> (array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    swap(array, i, j)
  }
  return array
}

export function sortAscending<T> (array: T[], accessor: (x: T) => number) {
  return array.sort((a, b) => accessor(a) - accessor(b))
}

export function sortDescending<T> (array: T[], accessor: (x: T) => number) {
  return array.sort((a, b) => accessor(b) - accessor(a))
}

export function permutations<T> (array: T[]) {
  const result = [array.slice()]
  const stack = makeArray(array.length, () => 0)
  let i = 1

  while (i < array.length) {
    if (stack[i] < i) {
      i % 2 === 0 ? swap(array, 0, i) : swap(array, stack[i], i)
      result.push(array.slice())
      stack[i]++
      i = 1
    } else {
      stack[i] = 0
      i++
    }
  }

  return result
}

// ---------------
// iterable functions
// ---------------
export function find<T> (list: Iterable<T>, iteratee: (elem: T) => boolean) {
  for (const elem of list) {
    if (iteratee(elem)) {
      return elem
    }
  }
}

export function findClosest<T> (
  list: Iterable<T>, target: number, iteratee: (elem: T) => number): T {

  let closestDistance = Infinity
  let closestValue!: T

  for (const elem of list) {
    const distance = Math.abs(iteratee(elem) - target)
    if (distance < closestDistance) {
      closestDistance = distance
      closestValue = elem
    }
  }

  return closestValue
}

export function every<T> (
  iterable: Iterable<T>, iteratee: (elem: T) => boolean) {
  for (const elem of iterable) {
    if (!iteratee(elem)) {
      return false
    }
  }
  return true
}

export function map<T, U> (
  iterable: Iterable<T>, mapFn: (x: T, index: number) => U | undefined): U[] {
  const array: U[] = []
  let i = 0
  for (const x of iterable) {
    const fx = mapFn(x, i++)
    if (fx !== undefined) {
      array.push(fx)
    }
  }
  return array
}

export function reduce<T, U> (
  iterable: Iterable<T>, reduceFn: (acc: U, x: T) => U, initialValue: U) {
  let acc = initialValue
  for (const x of iterable) {
    acc = reduceFn(acc, x)
  }
  return acc
}

export function randomSetElement<T> (set: Set<T>) {
  let i = Math.floor(Math.random() * set.size)
  for (const elem of set) {
    if (i-- === 0) {
      return elem
    }
  }
}

// ---------------
// Map functions
// ---------------
type GenericMap<T, U> = T extends object ? WeakMap<T, U> : Map<T, U>

export function getAndDelete<T, U> (map: GenericMap<T, U>, key: T) {
  const value = map.get(key)
  map.delete(key)
  return value
}

export function makeOrGet<T, U> (
  map: GenericMap<T, U>, key: T, makeFn: () => U) {
  if (!map.has(key)) {
    map.set(key, makeFn())
  }
  return map.get(key)!
}

// ---------------
// object functions
// ---------------
export function swap<T> (obj: T, i: keyof T, j: keyof T) {
  const t = obj[i]
  obj[i] = obj[j]
  obj[j] = t
}

export function isEqual<T extends Record<any, any>> (a: T, b: T): boolean {
  for (const key in a) {
    if (a[key] !== b[key]) {
      return false
    }
  }
  return true
}

export function copy<T> (source: T): T {
  const copy = new (source as any).constructor()
  Object.assign(copy, source)
  return copy
}