import style from './FloatingBox.module.css'
import Component from './Component'
import { outsideElem } from './Game'
import clickOutside from '../clickOutside'

export default class FloatingBox extends Component {
  constructor(parentBBox: DOMRect) {
    super()

    this.element.classList.add(style.container)
    this.element.style.transform = `translate(${parentBBox.left}px, ${parentBBox.bottom}px)`

    // setTimeout(() => {
    //   console.log(this.element.getBoundingClientRect())
    // })

    this.onRemove(clickOutside(this.element, () => {
      this.remove()
    }))

    outsideElem.append(this.element)
  }
}