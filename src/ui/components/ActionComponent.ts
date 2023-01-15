import Component from './Component'
import Action from '../../behavior/Action'
import { borderRadius, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import colors from '../colors'
import GameTime from '../../GameTime'

export default class ActionComponent extends Component {
  private readonly name: HTMLElement
  private readonly time: HTMLElement

  constructor (public action: Action) {
    super()

    this.element.classList.add(containerStyle)

    this.name = document.createElement('div')
    this.name.textContent = action.icon
    this.element.append(this.name)

    this.time = document.createElement('div')
    this.element.append(this.time)

    this.element.animate(
        { opacity: [0, 1] },
        { duration: duration.fast })

    this.update()
  }

  update () {
    if (this.action.time <= 0) {
      this.time.animate({
        opacity: 0,
      }, {
        duration:
        duration.fast, fill: 'forwards',
      })
    } else {
      this.time.textContent = GameTime.displaySeconds(this.action.time)
    }
  }

  exit () {
    this.element.animate({
      opacity: 0,
    }, {
      duration: duration.fast,
    }).onfinish = () => {
      this.remove()
    }
  }
}

const containerStyle = makeStyle({
  fontSize: `1rem`,
  textAlign: `center`,
  color: colors.yellow['400'],
  background: colors.yellow['400'] + '44',
  borderRadius,
})