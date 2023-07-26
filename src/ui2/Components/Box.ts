import Component from './Component'

export default class Box extends Component {
  x = 0
  y = 0
  width = 0
  height = 0

  get centerX () {
    return this.x + this.width * 0.5
  }

  get centerY () {
    return this.y + this.height * 0.5
  }

  override onInit () {

  }
}