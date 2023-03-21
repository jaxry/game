import GameObject from '../../GameObject'
import Window from './Window'
import { makeStyle } from '../makeStyle'
import Zone from './Zone'

export default class ObjectInfo extends Window {
  constructor (object: GameObject, parentBBox: DOMRect) {
    super(parentBBox)

    this.element.classList.add(containerStyle)

    const name = document.createElement('div')
    name.textContent = object.type.name
    this.element.append(name)

    if (object.contains) {
      const inventory = this.newComponent(Zone, object)
      this.element.append(inventory.element)
    }
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  justifyContent: `center`,
  alignItems: `center`,
})