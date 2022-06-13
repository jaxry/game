import Component from './Component'
import Action from '../../behavior/Action'
import { borderRadius, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import colors from '../colors'

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

    this.update()
  }

  update () {
    if (this.action.time <= 0) {
      this.time.animate({ opacity: 0 },
          { duration: duration.fast, fill: 'forwards' })
    } else {
      this.time.textContent = this.action.time.toString()
    }
  }
}

const containerStyle = makeStyle({
  fontSize: `1.5rem`,
  textAlign: `center`,
  color: colors.yellow['400'],
  background: colors.yellow['400'] + '44',
  borderRadius,
})