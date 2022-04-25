import Component from './Component'
import Action from '../../behavior/Action'
import $ from '../makeDomTree'
import style from './ActionComponent.module.css'

export default class ActionComponent extends Component {
  private readonly name: HTMLElement
  private readonly time: HTMLElement

  constructor(public action: Action) {
    super()

    this.name = $('span', null, action.icon)
    this.time = $('span')

    $(this.element, style.container, [this.name, this.time])

    this.update()
  }

  update() {
    if (this.action.time <= 0) {
      this.time.animate({ opacity: 0}, {duration: 250, fill: 'forwards'})
    } else {
      this.time.textContent = this.action.time.toString()
    }
  }
}