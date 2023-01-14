import Component from './Component'
import { outsideElem } from './App'
import clickOutside from '../clickOutside'
import { makeStyle } from '../makeStyle'
import { translate } from '../../util'
import makeDraggable from '../makeDraggable'

export default class Window extends Component {
  private posX: number
  private posY: number

  constructor (parentBBox: DOMRect) {
    super()

    this.element.classList.add(containerStyle)

    this.onRemove(clickOutside(this.element, () => {
      this.remove()
    }))

    outsideElem.append(this.element)

    this.posX = parentBBox.left
    this.posY = parentBBox.bottom

    this.updatePosition()

    makeDraggable(this.element, {
      onDrag: (e, relative, difference) => {
        this.posX += difference.x
        this.posY += difference.y
        this.updatePosition()
      },
    })
  }

  private updatePosition () {
    this.element.style.transform = translate(this.posX, this.posY)
  }
}

const containerStyle = makeStyle({})