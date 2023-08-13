import Component from './Component'
import { outsideElem } from './App'
import clickOutside from '../clickOutside'
import { makeStyle } from '../makeStyle'
import makeDraggable from '../makeDraggable'
import { boxShadowLarge, duration, fadeIn, fadeOut } from '../theme'

export default class Window extends Component {
  posX = 0
  posY = 0
  rendered = false

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.onRemove(clickOutside(this.element, () => {
      fadeOut(this.element, () => {
        this.remove()
      }, duration.short)
    }))

    outsideElem.append(this.element)

    makeDraggable(this.element, {
      onDrag: (e) => {
        this.setPosition(this.posX + e.movementX, this.posY + e.movementY)
      },
    })
  }

  setPosition (x: number, y: number) {
    if (!this.rendered) {
      this.rendered = true
      this.onInit?.()
      fadeIn(this.element, duration.short)
    }

    this.posX = x
    this.posY = y
    this.element.style.translate = `${this.posX}px ${this.posY}px`
  }
}

const containerStyle = makeStyle({
  position: `fixed`,
  top: `0`,
  left: `0`,
  // background: windowColor,
  boxShadow: boxShadowLarge,
})