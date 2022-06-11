import Component from './Component'
import style from './Inventory.module.css'
import ObjectCard from './ObjectCard'
import { game } from '../../Game'
import { dragAndDropGameObject, staggerStateChange } from './Game'
import TransferAction from '../../actions/Transfer'
import { GameObject } from '../../GameObject'
import { Effect } from '../../behavior/Effect'
import { removeElemAndAnimateList } from '../removeElementFromList'
import { getAndDelete } from '../../util'
import { duration } from '../theme'

export default class Inventory extends Component {
  private objectToCard: Map<GameObject, ObjectCard> = new Map()

  constructor (public object: GameObject) {
    super()

    this.element.classList.add(style.container)

    for (const item of object.contains) {
      this.makeCard(item)
    }

    const self = this

    this.newEffect(class extends Effect {
      onActivate () {
        this.onEvent(this.object, 'enter', ({ item }) => {
          staggerStateChange.add(() => self.makeCard(item, true))
        })
        this.onEvent(this.object, 'leave', ({ item }) => {
          staggerStateChange.add(() => self.removeCard(item))
        })
      }
    }, object)

    this.addDragAndDrop()
  }

  private makeCard (object: GameObject, animate = false) {
    const card = this.newComponent(ObjectCard, object)
    this.element.appendChild(card.element)
    this.objectToCard.set(object, card)
    if (animate) {
      card.element.animate({
        opacity: [0, 1],
        transform: [`translate(0, 100%)`, `translate(0, 0)`],
      }, {
        duration: duration.normal,
        easing: 'ease-in-out',
      })
    }
  }

  private removeCard (object: GameObject) {
    const card = getAndDelete(this.objectToCard, object)!
    card.element.animate({
      opacity: 0,
      transform: `translate(0, 100%)`,
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      removeElemAndAnimateList(card.element)
      card.remove()
    }
  }

  private addDragAndDrop () {
    const draggable = (item: GameObject) => {
      if (new TransferAction(game.player, item, this.object).condition()) {
        return 'move'
      }
    }
    dragAndDropGameObject.drop(this.element, draggable, (item) => {
      new TransferAction(game.player, item, this.object).activate()
    })

    this.on(dragAndDropGameObject.onDrag, (item) => {
      if (item && draggable(item)) {
        this.element.classList.add(style.dragging)
      } else {
        this.element.classList.remove(style.dragging)
      }
    })
  }
}