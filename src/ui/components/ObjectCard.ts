import Component from './Component'
import { GameObject } from '../../GameObject'
import style from './ObjectCard.module.css'
import { isPlayer } from '../../behavior/player'
import ObjectInfo from './ObjectInfo'
import Action from '../../behavior/Action'
import $ from '../makeDomTree'
import ActionComponent from './ActionComponent'
import { dragAndDropGameObject } from './Game'
import TransferAction from '../../actions/Transfer'
import { game } from '../../Game'
import animationDuration from '../animationDuration'

export default class ObjectCard extends Component {
  // private readonly actionContainer: HTMLElement
  private actionComponent?: ActionComponent

  constructor(object: GameObject) {
    super()

    this.element.classList.add(style.container)
    if (isPlayer(object)) {
      this.element.classList.add(style.player)
    }

    const icon = $('div', style.icon, object.type.icon)
    this.element.append(icon)

    // this.actionContainer = $('div')
    // this.element.append(this.actionContainer)

    if (object.activeAction) {
      this.setAction(object.activeAction)
    }

    this.element.addEventListener('click', () => {
      this.newComponent(ObjectInfo, object,
          this.element.getBoundingClientRect())
    })

    let action: Action | null = null
    dragAndDropGameObject.drag(this.element, object, icon)
    dragAndDropGameObject.drop(this.element, (item) => {
      action = new TransferAction(game.player, item, object)
      if (action.condition()) {
        return 'move'
      }
    }, (item) => {
      new TransferAction(game.player, item, object).activate()
    })
  }

  setAction(action: Action) {
    if (this.actionComponent) {
      this.actionComponent.remove()
    }
    this.actionComponent = this.newComponent(ActionComponent, action)
    this.element.append(this.actionComponent.element)

    this.actionComponent.element.animate(
        { opacity: [0, 1] },
        { duration: animationDuration.fast })
  }

  clearAction() {
    if (!this.actionComponent) {
      return
    }

    const component = this.actionComponent
    this.actionComponent = undefined

    component.element.animate({
      opacity: 0,
    }, {
      duration: animationDuration.fast,
    }).onfinish = () => {
      component.remove()
    }
  }

  update() {
    this.actionComponent?.update()
  }
}