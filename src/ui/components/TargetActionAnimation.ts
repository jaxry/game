import Component from './Component'
import Action from '../../behavior/Action'
import { outsideElem } from './App'
import { duration } from '../theme'
import { makeStyle } from '../makeStyle'
import { numToPx } from '../../util'

export default class TargetActionAnimation extends Component {
  constructor (action: Action, from: HTMLElement, to: HTMLElement) {
    super()

    outsideElem.append(this.element)

    this.element.classList.add(containerStyle)

    this.element.textContent = action.icon

    this.element.animate({
      transform: [center(from), center(to)],
      opacity: [0, 1, 1, 1, 0],
    }, {
      duration: duration.slow,
      easing: 'cubic-bezier(0.5,0,0,1)',
    }).onfinish = () => this.remove()
  }
}

const containerStyle = makeStyle({
  position: `fixed`,
  fontSize: `2rem`,
  pointerEvents: `none`,
})

function center (elem: HTMLElement) {
  const r = elem.getBoundingClientRect()
  const x = r.x + r.width / 2
  const y = r.y + r.height / 2
  return `translate(-50%,-50%) translate(${numToPx(x)}, ${numToPx(y)})`
}