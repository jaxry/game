import Component from './Component'
import $ from '../makeDomTree'
import style from './Player.module.css'
import ObjectCard from './ObjectCard'
import { game } from '../../Game'
import { dragAndDropGameObject } from './Game'
import TransferAction from '../../actions/Transfer'
import { GameObject } from '../../GameObject'

export default class Player extends Component {
  inventory = $('div', style.inventory)

  constructor() {
    super()

    for (const item of game.player.contains) {
      const card = this.newComponent(ObjectCard, item)
      this.inventory.appendChild(card.element)
    }

    const draggable = (item: GameObject) => {
      if (new TransferAction(game.player, item, game.player).condition()) {
        return 'move'
      }
    }
    dragAndDropGameObject.drop(this.inventory, draggable, (item) => {
      new TransferAction(game.player, item, game.player).activate()
    })

    this.on(dragAndDropGameObject.onDrag, (item) => {
      if (item && draggable(item)) {
        this.inventory.classList.add(style.dragging)
      } else {
        this.inventory.classList.remove(style.dragging)
      }
    })

    $(this.element, style.container, [
      $('div', null, 'Inventory'),
      this.inventory,
    ])
  }
}