import Component from './Component'
import GameObject from '../../GameObject'
import { borderRadius, boxShadow, fadeIn, objectCardColor } from '../theme'
import { makeStyle } from '../makeStyle'
import ActionComponent from './ActionComponent'
import animatedBackground, {
  animatedBackgroundTemplate, fadeOutAbsolute,
} from '../animatedBackground'
import Inventory from './Inventory'

export default class ObjectCard extends Component {
  actionComponent?: ActionComponent

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    this.element.textContent = this.object.type.name

    animatedBackground(this.element, backgroundStyle)

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

  showAction () {
    this.actionComponent =
        this.newComponent(ActionComponent, this.object.activeAction)
            .appendTo(this.element)
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

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  background: objectCardColor,
  borderRadius,
  boxShadow,
})