import Component from './Component'
import style from './Player.module.css'
import { game } from '../../Game'
import Inventory from './Inventory'

export default class Player extends Component {
  constructor() {
    super()

    this.element.classList.add(style.container)

    const inventory = document.createElement('div')
    inventory.textContent = 'Inventory'

    this.element.append(
        inventory,
        this.newComponent(Inventory, game.player).element)
  }
}