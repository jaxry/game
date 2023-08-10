import Component from './Component'
import GameObject from '../../GameObject'
import {
  borderRadius, boxShadow, fadeIn, objectCardColor, objectCardPlayerColor,
  objectSpeakColor,
} from '../theme'
import { addStyle, makeStyle } from '../makeStyle'
import ActionComponent from './ActionComponent'
import animatedBackground, {
  animatedBackgroundTemplate, fadeOutAbsolute,
} from '../animatedBackground'
import Inventory from './Inventory'
import Action from '../../actions/Action'
import { createElement } from '../createElement'
import animatedContents from '../animatedContents'
import { isPlayer } from '../../behavior/player'

export default class ObjectCard extends Component {
  actionComponent?: ActionComponent

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)
    this.element.classList.toggle(playerStyle, isPlayer(this.object))

    this.element.textContent = this.object.type.name

    animatedBackground(this.element, backgroundStyle)
    animatedContents(this.element)

    let inventory: Inventory | undefined
    this.element.addEventListener('click', () => {
      if (!inventory) {
        inventory = this.newComponent(Inventory, this.object)
            .appendTo(this.element)
        fadeIn(inventory.element)
      } else {
        const thisInventory = inventory
        inventory = undefined
        fadeOutAbsolute(thisInventory.element, () => {
          thisInventory.remove()
        })
      }
    })
  }

  showMessage (message: string) {
    const element = createElement(this.element, 'q', messageStyle, message)
    fadeIn(element)
    element.animate({
      opacity: [`1`, `0`],
    }, {
      duration: 5000,
      easing: `ease-in`,
    }).onfinish = () => {
      element.remove()
    }
  }

  showAction (action: Action) {
    this.actionComponent =
        this.newComponent(ActionComponent, action).appendTo(this.element)
    fadeIn(this.actionComponent.element)
  }

  hideAction () {
    const actionComponent = this.actionComponent!
    if (!actionComponent) return
    fadeOutAbsolute(actionComponent.element, () => {
      actionComponent.remove()
    })
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  padding: `0.5rem`,
  width: `max-content`,
})

const playerStyle = makeStyle({})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  background: objectCardColor,
  borderRadius,
  boxShadow,
})

addStyle(`.${playerStyle} > .${backgroundStyle}`, {
  background: objectCardPlayerColor,
})

const messageStyle = makeStyle({
  display: `block`,
  color: objectSpeakColor,
})