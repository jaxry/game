import Component from './Component'
import TimeComponent from './Time'
import Inventory from './Inventory'
import { game } from '../../Game'

export default class GameSidebar extends Component {
  constructor() {
    super()

    const time = this.newComponent(TimeComponent)
    this.element.append(time.element)

    const inventory = this.newComponent(Inventory, game.player)
    this.element.append(inventory.element)
  }
}