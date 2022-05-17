import Component from './Component'
import Action from '../../behavior/Action'
import style from './TargetActionAnimation.module.css'
import { outsideElem } from './App'
import animationDuration from '../animationDuration'

export default class TargetActionAnimation extends Component {
  constructor(action: Action, from: HTMLElement, to: HTMLElement) {
    super()

    outsideElem.append(this.element)

    this.element.classList.add(style.container)

    this.element.textContent = action.icon

    this.element.animate({
      transform: [center(from), center(to)],
      opacity: [0, 1, 1, 1, 0],
    }, {
      duration: animationDuration.slow,
      easing: 'cubic-bezier(0.5,0,0,1)',
    }).onfinish = () => this.remove()
  }
}

function center(elem: HTMLElement) {
  const r = elem.getBoundingClientRect()
  const x = r.x + r.width / 2
  const y = r.y + r.height / 2
  return `translate(-50%,-50%) translate(${x}px, ${y}px)`
}