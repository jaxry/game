import Component from './Component'
import { outsideElem } from './App'
import clickOutside from '../clickOutside'
import { makeStyle } from '../makeStyle'
import { translate } from '../../util'
import makeDraggable from '../makeDraggable'
import { boxShadowLarge, windowColor } from '../theme'

export default class Window extends Component {
  posX = 0
  posY = 0

  constructor (parentBBox: DOMRect) {
    super()

    this.element.classList.add(containerStyle)

    this.onRemove(clickOutside(this.element, () => {
      this.remove()
    }))

    outsideElem.append(this.element)

    this.setPosition(
        parentBBox.left + parentBBox.width / 2,
        parentBBox.top + parentBBox.height / 2)

    makeDraggable(this.element, {
      onDrag: (e) => {
        this.setPosition(this.posX + e.movementX, this.posY + e.movementY)
      },
    })
  }

  setPosition (x: number, y: number) {
    this.posX = x
    this.posY = y
    this.element.style.transform = translate(this.posX, this.posY)
  }
}

const containerStyle = makeStyle({
  background: windowColor,
  boxShadow: boxShadowLarge,
})