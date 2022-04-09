import style from './FloatingBox.module.css'
import Component from './Component'
import { outsideElem } from './App'
import clickOutside from '../clickOutside'

export default class FloatingBox extends Component {
  exit = () => {}

  constructor(parentBBox: DOMRect) {
    super()

    this.element.classList.add(style.container)
    this.element.style.transform = `translate(${parentBBox.left}px, ${parentBBox.bottom}px)`

    setTimeout(() => {
      console.log(this.element.getBoundingClientRect())

    })

    this.register(clickOutside(this.element, () => {
      this.exit()
    }))

    outsideElem.append(this.element)
  }
}