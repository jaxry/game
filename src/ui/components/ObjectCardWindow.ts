import GameObject from '../../GameObject'
import Inventory from './Inventory'
import { createDiv, createElement } from '../createElement'
import { buttonStyle } from '../theme'
import Window from './Window'
import { selector } from './GameUI'

export default class ObjectCardWindow extends Window {
  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    createDiv(this.element, undefined, this.object.type.name)

    if (this.object.type.isContainer) {
      this.newComponent(Inventory, this.object).appendTo(this.element)
    }

    const button = createElement(this.element, 'button', buttonStyle, `Move`)
    button.addEventListener('click', () => {
      selector.selectionStart.emit()
    })
  }
}