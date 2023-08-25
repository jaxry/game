import GameObject from '../../GameObject'
import Inventory from './Inventory'
import { createDiv, createElement } from '../createElement'
import { buttonStyle } from '../theme'
import Window from './Window'
import { getPlayerActions } from '../../behavior/player'

export default class ObjectCardWindow extends Window {
  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    createDiv(this.element, undefined, this.object.type.name)

    if (this.object.type.isContainer) {
      this.newComponent(Inventory, this.object).appendTo(this.element)
    }

    for (const action of getPlayerActions(this.object)) {
      // add spaces to class name
      const name = action.constructor.name.replaceAll(/[A-Z]/g, ' $&')
      const button = createElement(this.element, 'button', buttonStyle, name)
      button.addEventListener('click', () => {
        this.animateRemove()
        action.activate()
      })
    }
  }
}