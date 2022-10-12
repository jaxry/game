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

// ---------------
// array functions
// ---------------
export function randomElement<T> (array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function shuffleArray<T> (array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    swap(array, i, j)
  }
}

export function deleteElem<T> (array: T[], elem: T) {
  array.splice(array.indexOf(elem), 1)
}

export function sortedInsert<T> (
    array: T[], value: T, iteratee: (element: T) => number,
    descending = false) {
  for (let i = 0; i < array.length; i++) {
    const foundPlace =
        (!descending && iteratee(value) < iteratee(array[i])) ||
        (descending && iteratee(value) > iteratee(array[i]))
    if (foundPlace) {
      array.splice(i, 0, value)
      return array
    }
  }
  array.push(value)
  return array
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

export function mapIter<T, U> (
    iterable: Iterable<T>, mapFn: (x: T, index: number) => U) {
  const array: U[] = []
  let i = 0
  for (const x of iterable) {
    array.push(mapFn(x, i++))
  }
  return array
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
  for (const key of Object.keys(a)) {
    if (a[key] !== b[key]) {
      return false
    }
  }
  return true
}

export function copy<T> (source: T): T {
  const copy = Object.create(Object.getPrototypeOf(source))
  Object.assign(copy, source)
  return copy
}

// ---------------
// other functions
// ---------------
export function getAndDelete<T, U> (map: Map<T, U>, key: T): U | undefined {
  const value = map.get(key)
  map.delete(key)
  return value
}

export function removeChildren (node: Node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

export function numToPixel (num: number) {
  return Math.round(num).toString()
}

export function numToPx (num: number) {
  return numToPixel(num) + 'px'
}
