import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import { getAndDelete, makeOrGet, numToPx, translate } from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import makeDraggable from '../makeDraggable'
import { borderRadius, boxShadow } from '../theme'
import CardPhysics from '../game/CardPhysics'

export default class Inventory extends GameComponent {
  onResize?: (xDiff: number, yDiff: number) => void

  private cardContainer = document.createElement('div')

  private objectToCard = new Map<GameObject, ObjectCard>()
  private cardToObject = new WeakMap<ObjectCard, GameObject>()

  private cardPhysics = new CardPhysics(this.objectToCard, () => {
    this.updatePositions()
  })

  private left = 0
  private right = 0
  private top = 0
  private bottom = 0

  constructor (public container: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    this.element.append(this.cardContainer)

    const self = this

    this.newEffect(class extends Effect {
      override events () {
        this.on(this.object, 'enter', ({ item }) => {
          self.objectEnter(item)
        })
        this.on(this.object, 'leave', ({ item }) => {
          self.objectLeave(item)
        })
      }
    }, container)

    dragAndDropGameObject.drop(this.element, (item) => {
      if (new TransferAction(game.player, item, this.container).condition()) {
        return 'move'
      }
    }, (item) => {
      setPlayerEffect(new TransferAction(game.player, item, this.container))
    })

    if (this.container.contains) {
      for (const obj of this.container.contains) {
        this.makeCard(obj)
      }
    }

    // Wait a frame for cards to render. Simulation requires rendered bboxes
    requestAnimationFrame(() => this.cardPhysics.simulate())
  }

  private get scale () {
    // If map is zoomed out, the zone is scaled down via transform.
    // Element.boundingClientRect() calculations need that scale applied
    return this.element.getBoundingClientRect().width
        / this.element.offsetWidth
  }

  private makeCard (object: GameObject) {
    const card = makeOrGet(this.objectToCard, object, () =>
        this.newComponent(ObjectCard, object))

    card.onInventoryResized = (xDiff, yDiff) => {
      object.position.x += xDiff / 2 // divide by 2 to account for centered card
      object.position.y += yDiff / 2
      this.updatePositions()
    }

    this.cardToObject.set(card, object)

    card.element.classList.add(cardStyle)

    this.makeCardDraggable(object, card)

    this.cardContainer.append(card.element)

    return card
  }

  private makeCardDraggable (object: GameObject, card: ObjectCard) {
    let relX = 0
    let relY = 0

    makeDraggable(card.element, {
      onDown: (e) => {
        const { left, top, width, height }
            = card.element.getBoundingClientRect()

        relX = (e.clientX - left - width / 2) / this.scale
        relY = (e.clientY - top - height / 2) / this.scale

        this.cardPhysics.ignore(object, true)

        this.cardContainer.append(card.element)
      },
      onDrag: (e) => {
        const bbox = this.element.getBoundingClientRect()
        object.position.x = this.left + (e.clientX - bbox.x) / this.scale - relX
        object.position.y = this.top + (e.clientY - bbox.y) / this.scale - relY
        this.updatePositions()
      },
      onUp: () => {
        this.cardPhysics.ignore(object, false)
        this.cardPhysics.simulate()
      },
    })
  }

  private objectEnter (obj: GameObject) {
    const card = this.makeCard(obj)
    this.updatePositions()
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!
    card.remove()
    this.updatePositions()
  }

  private updatePositions () {
    let left = Infinity
    let top = Infinity
    let right = -Infinity
    let bottom = -Infinity

    for (const [object, card] of this.objectToCard) {
      const x = object.position.x
      const y = object.position.y
      left = Math.min(left, x - card.element.offsetWidth / 2)
      top = Math.min(top, y - card.element.offsetHeight / 2)
      right = Math.max(right, x + card.element.offsetWidth / 2)
      bottom = Math.max(bottom, y + card.element.offsetHeight / 2)
    }

    for (const [object, card] of this.objectToCard) {
      const tx = object.position.x - left
      const ty = object.position.y - top
      card.element.style.transform =
          `${translate(tx, ty)} translate(-50%, -50%)`
    }

    const width = Math.max(32, right - left)
    const height = Math.max(32, bottom - top)

    this.element.style.width = numToPx(width)
    this.element.style.height = numToPx(height)

    const xDiff = left - this.left + right - this.right
    const yDiff = top - this.top + bottom - this.bottom

    if (xDiff !== 0 || yDiff !== 0) {
      this.onResize?.(xDiff, yDiff)
    }

    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  cursor: `pointer`,
  borderRadius,
  boxShadow,
})

const cardStyle = makeStyle({
  position: `absolute`,
  cursor: `default`,
})