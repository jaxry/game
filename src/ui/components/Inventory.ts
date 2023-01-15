import ObjectCard from './ObjectCard'
import { game } from '../../Game'
import { dragAndDropGameObject } from './GameUI'
import TransferAction from '../../actions/Transfer'
import GameObject from '../../GameObject'
import Effect from '../../behavior/Effect'
import { getAndDelete, makeOrGet } from '../../util'
import { borderColor } from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'

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
      override events () {
        this.on(this.object, 'enter', ({ item }) => {
          self.makeCard(item)
        })
        this.on(this.object, 'leave', ({ item }) => {
          self.removeCard(item)
        })
      }
    }, object)

    this.addDragAndDrop()
  }

  private makeCard (object: GameObject, animate = true) {
    const card = makeOrGet(this.objectToCard, object, () =>
        this.newComponent(ObjectCard, object))

    this.element.appendChild(card.element)

    if (!animate) {
      return
    }

    card.enter()
  }

  private removeCard (object: GameObject) {
    const card = getAndDelete(this.objectToCard, object)!
    card.exit()
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
  padding: `0.5rem`,
})

makeStyle(`.${containerStyle} > *`, {
  margin: `0.25rem`,
})

const draggingStyle = makeStyle({
  outline: `1px dashed ${borderColor}`,
})