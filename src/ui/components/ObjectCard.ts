import Component from './Component'
import { GameObject } from '../../GameObject'
import style from './ObjectCard.module.css'
import { isPlayer } from '../../behavior/player'
import ObjectInfo from './ObjectInfo'
import Action from '../../behavior/Action'
import $ from '../makeDomTree'
import ActionComponent from './ActionComponent'

export default class ObjectCard extends Component {
  private readonly actionContainer: HTMLElement
  private actionComponent?: ActionComponent

  constructor(object: GameObject) {
    super()

    this.element.classList.add(style.container)
    if (isPlayer(object)) {
      this.element.classList.add(style.player)
    }

    this.element.append($('div', style.name, object.type.icon))

    this.actionContainer = $('div')
    this.clearAction()
    this.element.append(this.actionContainer)

    this.element.addEventListener('click', () => {
      const info = this.newComponent(ObjectInfo, object,
          this.element.getBoundingClientRect())
      info.exit = () => this.removeComponent(info)
    })
  }

  setAction(action: Action) {
    if (this.actionComponent) {
      this.removeComponent(this.actionComponent)
    }
    this.actionComponent = this.newComponent(ActionComponent, action)
    this.actionContainer.append(this.actionComponent.element)
    this.actionComponent.element.animate({opacity: [0, 1]}, {duration: 250})
  }

  clearAction() {
    if (this.actionComponent) {
      const component = this.actionComponent
      component.element.animate({
        opacity: [1, 0]
      }, {
        duration: 250
      }).onfinish = () => {
        this.removeComponent(component)
      }
      this.actionComponent = undefined
    }
  }

  update() {
    this.actionComponent?.update()
  }
}