import { GameObject } from '../../GameObject'
import Window from './Window'
import Inventory from './Inventory'
import { makeStyle } from '../makeStyle'
import colors from '../colors'

export default class ObjectInfo extends Window {
  constructor (object: GameObject, parentBBox: DOMRect) {
    super(parentBBox)

    this.element.classList.add(containerStyle)

    const name = document.createElement('div')
    name.textContent = object.type.name
    this.element.append(name)

    if (object.contains) {
      const inventory = this.newComponent(Inventory, object)
      this.element.append(inventory.element)
    }
  }
}

const containerStyle = makeStyle({
  background: colors.slate['700'],
})