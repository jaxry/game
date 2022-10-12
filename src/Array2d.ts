export default class Array2d<T> {
  array: T[] = []

  readonly width: number
  readonly height: number

  constructor(width: number, height: number, fill: T) {
    this.width = width
    this.height = height
    for (let i = 0; i < width * height; i++) {
      this.array.push(fill)
    }
  }

  *[Symbol.iterator]() {
    yield* this.array
  }

  *iter2d(): Generator<[number, number, T]> {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        yield [x, y, this.get(x, y)]
      }
    }
  }

  get(x: number, y: number) {
    return this.array[x + y * this.width]
  }

  set(x: number, y: number, value: T) {
    this.array[x + y * this.width] = value
  }
}