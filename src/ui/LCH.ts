import { mod } from '../util'

export default class LCH {
  constructor (public l: number, public c: number, public h: number) {
  }

  toString () {
    return `oklch(${this.l}% ${this.c * 0.4 / 100} ${mod(this.h, 1) * 360})`
  }

  addL (l: number) {
    return new LCH(this.l + l, this.c, this.h)
  }

  setL (l: number) {
    return new LCH(l, this.c, this.h)
  }

  addC (c: number) {
    return new LCH(this.l, this.c + c, this.h)
  }

  setC (c: number) {
    return new LCH(this.l, c, this.h)
  }

  addH (h: number) {
    return new LCH(this.l, this.c, this.h + h)
  }

  setH (h: number) {
    return new LCH(this.l, this.c, h)
  }
}