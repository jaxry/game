import Component from './Component'
import { game } from '../../Game'
import Inventory from './Inventory'

export default class Player extends Component {
  constructor () {
    super()

    const inventory = document.createElement('div')
    inventory.textContent = 'Inventory'

    this.element.append(
        inventory,
        this.newComponent(Inventory, game.player).element)
  }
}