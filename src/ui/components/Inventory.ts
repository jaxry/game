import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import {
  getAndDelete, makeOrGet, moveToTop, numToPx, translate,
} from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import makeDraggable from '../makeDraggable'
import { borderRadius, boxShadow } from '../theme'
import CardPhysics from '../game/CardPhysics'

export default class Inventory extends GameComponent {
  onResize?: (xDiff: number, yDiff: number) => void

  private objectToCard = new Map<GameObject, ObjectCard>()
  private cardToObject = new WeakMap<ObjectCard, GameObject>()

  private cardPhysics = new CardPhysics(() => {
    this.updatePositions()
  })

  private left = 0
  private right = 0
  private top = 0
  private bottom = 0

  constructor (public container: GameObject) {
    super()

    this.element.classList.add(containerStyle)

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

    this.cardPhysics.simulate(this.objectToCard, true)
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

    card.onResized = (xDiff, yDiff) => {
      object.position.x += xDiff
      object.position.y += yDiff
      this.cardPhysics.simulate()
    }
    this.cardToObject.set(card, object)

    card.element.classList.add(cardStyle)

    this.makeCardDraggable(object, card)

    this.element.append(card.element)

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

        moveToTop(card.element)
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
    this.cardPhysics.simulate(this.objectToCard)
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!
    card.remove()
    this.cardPhysics.simulate(this.objectToCard)
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

    this.element.style.width = numToPx(Math.max(32, right - left))
    this.element.style.height = numToPx(Math.max(32, bottom - top))

    const xDiff = (left - this.left + right - this.right) / 2
    const yDiff = (top - this.top + bottom - this.bottom) / 2

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
  contain: `strict`,
})

const cardStyle = makeStyle({
  position: `absolute`,
  cursor: `default`,
})