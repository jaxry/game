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
import { border, borderRadius, boxShadow, mapNodeColor } from '../theme'
import CardPhysics from '../game/CardPhysics'

export default class Zone extends GameComponent {
  private cardContainer = document.createElement('div')

  private objectToCard = new Map<GameObject, ObjectCard>()
  private cardToObject = new WeakMap<ObjectCard, GameObject>()
  private zoneEvents: Effect

  private cardPhysics = new CardPhysics(this.objectToCard, () => {
    this.updatePositions()
  })

  private left = 0
  private top = 0

  constructor (public zone: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    this.element.append(this.cardContainer)

    const self = this

    this.zoneEvents = this.newEffect(class extends Effect {
      override events () {
        this.on(this.object, 'enter', ({ item }) => {
          self.objectEnter(item)
        })
        this.on(this.object, 'leave', ({ item }) => {
          self.objectLeave(item)
        })
      }
    }, zone)

    dragAndDropGameObject.drop(this.element, (item) => {
      if (new TransferAction(game.player, item, this.zone).condition()) {
        return 'move'
      }
    }, (item) => {
      setPlayerEffect(new TransferAction(game.player, item, this.zone))
    })

    if (this.zone.contains) {
      for (const obj of this.zone.contains) {
        this.makeCard(obj)
      }
    }
    requestAnimationFrame(() => this.cardPhysics.simulate())
  }

  private get scale () {
    // If map is zoomed out, the zone is transform scaled down.
    // Element.boundingClientRect() calculations need that scale applied
    return this.element.getBoundingClientRect().width
        / this.element.offsetWidth
  }

  private makeCard (object: GameObject) {
    const card = makeOrGet(this.objectToCard, object, () =>
        this.newComponent(ObjectCard, object))

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
        object.position.x = (e.clientX - bbox.x) / this.scale - relX + this.left
        object.position.y = (e.clientY - bbox.y) / this.scale - relY + this.top
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
    // card.enter()
    this.updatePositions()
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!
    card.remove()
    // card.exit()
    this.updatePositions()
  }

  private updatePositions () {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const [object, card] of this.objectToCard) {
      minX = Math.min(minX, object.position.x - card.element.offsetWidth / 2)
      minY = Math.min(minY, object.position.y - card.element.offsetHeight / 2)
      maxX = Math.max(maxX, object.position.x + card.element.offsetWidth / 2)
      maxY = Math.max(maxY, object.position.y + card.element.offsetHeight / 2)
    }

    for (const [object, card] of this.objectToCard) {
      const t = translate(
          object.position.x - this.left, object.position.y - this.top)
      card.element.style.transform = `${t} translate(-50%, -50%)`
    }
    const width = Math.max(32, maxX - minX)
    const height = Math.max(32, maxY - minY)

    this.element.style.width = numToPx(width)
    this.element.style.height = numToPx(height)

    this.left = minX
    this.top = minY
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  cursor: `pointer`,
  background: mapNodeColor,
  border,
  borderRadius,
  boxShadow,
})

const cardStyle = makeStyle({
  position: `absolute`,
  cursor: `default`,
})