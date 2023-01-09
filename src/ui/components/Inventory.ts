import ObjectCard from './ObjectCard'
import { game } from '../../Game'
import { dragAndDropGameObject } from './GameUI'
import TransferAction from '../../actions/Transfer'
import GameObject from '../../GameObject'
import Effect from '../../behavior/Effect'
import { getAndDelete } from '../../util'
import { borderColor, duration } from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import DummyElement from '../DummyElement'

export default class Inventory extends GameComponent {
  private objectToCard: Map<GameObject, ObjectCard> = new Map()

  constructor (public object: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    if (object.contains) {
      for (const item of object.contains) {
        this.makeCard(item, false)
      }
    }

    const self = this

    this.newEffect(class extends Effect {
      override registerEvents () {
        this.onEvent(this.object, 'enter', ({ item }) => {
          self.makeCard(item)
        })
        this.onEvent(this.object, 'leave', ({ item }) => {
          self.removeCard(item)
        })
      }
    }, object)

    this.addDragAndDrop()
  }

  private makeCard (object: GameObject, animate = true) {
    const card = this.newComponent(ObjectCard, object)
    this.element.appendChild(card.element)
    this.objectToCard.set(object, card)

    if (!animate) {
      return
    }
    const dummy = new DummyElement(card.element)
    dummy.grow().onfinish = () => {
      dummy.element.replaceWith(card.element)
      card.element.animate({
        opacity: [0, 1],
        transform: [`translate(0,100%)`, `translate(0,0)`],
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
      transform: `translate(0,100%)`,
    }, {
      duration: duration.normal,
      easing: 'ease-in-out',
    }).onfinish = () => {
      new DummyElement(card.element).shrink()
      card.remove()
    }
  }

  private addDragAndDrop () {
    const draggable = (item: GameObject) => {
      if (new TransferAction(game.player, item, this.object).condition()) {
        return 'move'
      }
    }
    dragAndDropGameObject.drop(this.element, draggable,
        (item) => {
          new TransferAction(game.player, item, this.object).activate()
        })

    this.on(dragAndDropGameObject.onDrag, (item) => {
      if (item && draggable(item)) {
        this.element.classList.add(draggingStyle)
      } else {
        this.element.classList.remove(draggingStyle)
      }
    })
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  flexWrap: `wrap`,
  gap: `0.5rem`,
  padding: `0.5rem`,
})

const draggingStyle = makeStyle({
  outline: `1px dashed ${borderColor}`,
})