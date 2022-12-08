import Component from './Component'
import { game } from '../../Game'
import Inventory from './Inventory'

export default class Player extends Component {
  constructor () {
    super()

    const inventory = document.createElement('div')
    inventory.textContent = 'Inventory'
    this.element.append(inventory)

    let inventoryComponent = this.newComponent(Inventory, game.player)
    this.element.append(inventoryComponent.element)

    this.on(game.event.playerChange, () => {
      const newInventoryComponent = this.newComponent(Inventory, game.player)
      inventoryComponent.element.replaceWith(newInventoryComponent.element)
      inventoryComponent.remove()
      inventoryComponent = newInventoryComponent
    })
  }
}