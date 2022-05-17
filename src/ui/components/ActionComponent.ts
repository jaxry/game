import Component from './Component'
import Action from '../../behavior/Action'
import $ from '../makeDomTree'
import style from './ActionComponent.module.css'
import animationDuration from '../animationDuration'

export default class ActionComponent extends Component {
  private readonly name: HTMLElement
  private readonly time: HTMLElement

  constructor(public action: Action) {
    super()

    this.name = $('div', null, action.icon)
    this.time = $('div')

    $(this.element, style.container, [this.name, this.time])

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