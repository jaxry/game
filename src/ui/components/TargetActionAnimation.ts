import Component from './Component'
import Action from '../../behavior/Action'
import style from './TargetActionAnimation.module.css'
import { outsideElem } from './App'

export default class TargetActionAnimation extends Component {
  constructor(action: Action, from: DOMRect, to: DOMRect) {
    super()

    outsideElem.append(this.element)

    this.element.classList.add(style.container)

    this.element.textContent = action.icon

    this.element.animate({
      transform: [center(from), center(to)],
      opacity: [1, 1, 1, 0],
    }, {
      duration: 1000,
      easing: 'cubic-bezier(0.5,0,0,1)',
    }).onfinish = () => this.remove()
  }
}

function center(d: DOMRect) {
  const x = d.x + d.width / 2
  const y = d.y + d.height / 2
  return `translate(-50%,-50%) translate(${x}px, ${y}px)`
}