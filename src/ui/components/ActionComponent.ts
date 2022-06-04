import Component from './Component'
import Action from '../../behavior/Action'
import style from './ActionComponent.module.css'
import animationDuration from '../animationDuration'

export default class ActionComponent extends Component {
  private readonly name: HTMLElement
  private readonly time: HTMLElement

  constructor(public action: Action) {
    super()

    this.element.classList.add(style.container)

    this.name = document.createElement('div')
    this.name.textContent = action.icon
    this.element.append(this.name)

    this.time = document.createElement('div')
    this.element.append(this.time)

    this.update()
  }

  update() {
    if (this.action.time <= 0) {
      this.time.animate({ opacity: 0 },
          { duration: animationDuration.fast, fill: 'forwards' })
    } else {
      this.time.textContent = this.action.time.toString()
    }
  }
}