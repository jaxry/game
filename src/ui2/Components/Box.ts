import Component from './Component'

export default class Box extends Component {
  x = 0
  y = 0
  width = 0
  height = 0
  id = Math.random()

  get centerX () {
    return this.x + this.width * 0.5
  }

  get centerY () {
    return this.y + this.height * 0.5
  }

  get left () {
    return this.x
  }

  get right () {
    return this.x + this.width
  }

  get top () {
    return this.y
  }

  get bottom () {
    return this.y + this.height
  }

  setRect (rect: Float32Array) {
    rect[0] = this.left
    rect[1] = this.top
    rect[2] = this.right
    rect[3] = this.bottom
  }

  override hitArea (x: number, y: number): boolean {
    return x >= this.x && x < this.x + this.width &&
        y >= this.y && y < this.y + this.height
  }
}