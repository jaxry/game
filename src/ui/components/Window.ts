import style from './Window.module.css'
import Component from './Component'
import { outsideElem } from './App'
import clickOutside from '../clickOutside'

export default class Window extends Component {
  private posX!: number
  private posY!: number

  constructor (parentBBox: DOMRect) {
    super()

    this.element.classList.add(style.container)

    this.setPos(parentBBox.left, parentBBox.bottom)

    this.onRemove(clickOutside(this.element, () => {
      this.remove()
    }))

    outsideElem.append(this.element)

    const drag = (e: PointerEvent) => {
      this.setPos(this.posX + e.movementX, this.posY + e.movementY)
    }

    this.element.addEventListener('pointerdown', (e) => {
      window.addEventListener('pointermove', drag)

      const stopDragging = () => {
        window.removeEventListener('pointermove', drag)
      }
      window.addEventListener('pointerup', stopDragging, { once: true })
      window.addEventListener('pointerleave', stopDragging, { once: true })
    })
  }

  private setPos (x: number, y: number) {
    this.posX = x
    this.posY = y
    this.element.style.transform = `translate(${x}px, ${y}px)`
  }
}