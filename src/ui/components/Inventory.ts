import Effect from '../../effects/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/gameLoop'
import {
  copy, getAndDelete, isEqual, makeOrGet, moveToTop, numToPx, randomCentered,
  translate,
} from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import makeDraggable from '../makeDraggable'
import { dropBorder, duration } from '../theme'
import CardPhysics from './Inventory/CardPhysics'
import tween from '../tween'
import throttle from '../throttle'
import Bounds from './Inventory/Bounds'
import { attractableObjects } from './Inventory/attractableObjects'
import { getDimensions } from '../dimensionsCache'

export default class Inventory extends GameComponent {
  onResize?: (xDiff: number, yDiff: number) => void

  private objectToCard = new Map<GameObject, ObjectCard>()
  private bounds = new Bounds()
  private lastBounds = new Bounds()
  private targetBounds = new Bounds()
  private offset = new Bounds()
  private updatePositions = throttle(() => {
    this.updateTargetBounds()
    this.bounds.addBounds(this.targetBounds, this.offset)

    const xDiff = (this.bounds.left - this.lastBounds.left
        + this.bounds.right - this.lastBounds.right) / 2
    const yDiff = (this.bounds.top - this.lastBounds.top
        + this.bounds.bottom - this.lastBounds.bottom) / 2
    const firstRender = this.lastBounds.left === 0

    if ((xDiff !== 0 || yDiff !== 0) && !firstRender) {
      this.onResize?.(xDiff, yDiff)
    }

    Object.assign(this.lastBounds, this.bounds)

    this.element.style.width = numToPx(this.bounds.width())
    this.element.style.height = numToPx(this.bounds.height())

    for (const [object, card] of this.objectToCard) {
      const tx = object.position.x - this.bounds.left
      const ty = object.position.y - this.bounds.top
      card.element.style.transform =
          `${translate(tx, ty)} translate(-50%, -50%)`
    }
  })
  private cardPhysics = new CardPhysics(this.objectToCard, () => {
    this.updatePositions()
  })

  constructor (public container: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    const self = this

    this.newEffect(class extends Effect {
      override events () {
        this.onObjectChildren('enter', (object) => {
          self.objectEnter(object)
        })
        this.onObjectChildren('leave', (object) => {
          self.objectLeave(object)
        })
        this.onObjectChildren('actionStart', (object, action) => {
          for (const target of attractableObjects(action)) {
            self.cardPhysics.attract(action.object, target)
          }
        })
        this.onObjectChildren('actionEnd', (object, action) => {
          for (const target of attractableObjects(action)) {
            self.cardPhysics.release(action.object, target)
          }
        })
      }
    }, container)

    this.onRemove(dragAndDropGameObject.drop(this.element, {
      isDroppable: (item) => {
        const canDrop = new TransferAction(game.player, item,
            this.container).condition()
        this.element.classList.toggle(droppableStyle, canDrop)
        return canDrop ? 'move' : false
      },
      onDrop: (item) => {
        setPlayerEffect(new TransferAction(game.player, item, this.container))
      },
      onDone: () => {
        this.element.classList.remove(droppableStyle)
      },
    }))

    if (this.container.contains) {
      for (const obj of this.container.contains) {
        this.makeCard(obj, true)
      }
    }

    this.cardPhysics.simulate(true, true)
  }

  // TODO: Move object positioning to container behavior file
  private makeCard (object: GameObject, init?: boolean) {
    if (!init || object.position.x === 0 || object.position.y === 0) {
      const { x, y } = this.averageCardPosition()
      object.position.x = x + randomCentered(1)
      object.position.y = y + randomCentered(1)
    }

    const card = makeOrGet(this.objectToCard, object, () =>
        this.newComponent(ObjectCard, object).appendTo(this.element))

    card.element.classList.add(cardStyle)

    card.onResize = (xDiff, yDiff) => {
      object.position.x += xDiff
      object.position.y += yDiff
      this.cardPhysics.simulate()
    }

    this.makeCardDraggable(object, card)

    return card
  }

  private makeCardDraggable (object: GameObject, card: ObjectCard) {
    let relX = 0
    let relY = 0

    makeDraggable(card.element, {
      onDown: (e) => {
        const bbox = card.element.getBoundingClientRect()

        relX = (e.clientX - bbox.left - bbox.width / 2) / this.scale()
        relY = (e.clientY - bbox.top - bbox.height / 2) / this.scale()

        this.cardPhysics.ignore(object)

        moveToTop(card.element)
      },
      onDrag: (e) => {
        const bbox = this.element.getBoundingClientRect()
        object.position.x = this.bounds.left
            + (e.clientX - bbox.x) / this.scale() - relX
        object.position.y = this.bounds.top
            + (e.clientY - bbox.y) / this.scale() - relY
        this.updatePositions()
      },
      onUp: () => {
        this.cardPhysics.unignore(object)
      },
    })
  }

  private objectEnter (obj: GameObject) {
    const card = this.makeCard(obj)

    this.cardPhysics.simulate(true)
    this.animateBounds()

    card.element.animate({
      transform: [`scale(0)`, `scale(1)`],
    }, {
      duration: duration.normal,
      composite: `add`,
      easing: `ease`,
    })
  }

  private objectLeave (obj: GameObject) {
    const card = getAndDelete(this.objectToCard, obj)!
    this.animateBounds(true)

    card.element.animate({
      transform: `scale(0)`,
    }, {
      duration: duration.normal,
      composite: `add`,
      easing: `ease-in`,
    }).onfinish = () => {
      card.remove()
    }
  }

  private updateTargetBounds () {
    if (!this.objectToCard.size) {
      this.targetBounds.setSize(48)
      return
    }

    this.targetBounds.reset()

    for (const [object, card] of this.objectToCard) {
      const x = object.position.x
      const y = object.position.y
      const { width, height } = getDimensions(card.element)
      const w = width / 2
      const h = height / 2
      this.targetBounds.includePoint(x - w, y - h)
      this.targetBounds.includePoint(x + w, y + h)
    }

    this.targetBounds.expand(16)
  }

  private animateBounds (delay = false) {
    const oldTargetBounds = copy(this.targetBounds)

    this.updateTargetBounds()

    if (isEqual(oldTargetBounds, this.targetBounds)) {
      return
    }

    const diff =
        oldTargetBounds.subtractBounds(oldTargetBounds, this.targetBounds)

    this.offset.addBounds(this.offset, diff)

    tween((_, interpDiff) => {
      this.offset.left -= interpDiff(0, diff.left)
      this.offset.top -= interpDiff(0, diff.top)
      this.offset.right -= interpDiff(0, diff.right)
      this.offset.bottom -= interpDiff(0, diff.bottom)
      this.updatePositions()
    }, {
      duration: duration.slow,
      delay: delay ? duration.normal : 0,
    })
  }

  private averageCardPosition () {
    let x = 0
    let y = 0
    for (const object of this.objectToCard.keys()) {
      x += object.position.x
      y += object.position.y
    }
    x /= this.objectToCard.size || 1
    y /= this.objectToCard.size || 1
    return { x, y }
  }

  private scale () {
    // If map is zoomed out, the zone is scaled down via transform.
    // Element.boundingClientRect() calculations need that scale applied
    return this.element.getBoundingClientRect().width
        / this.element.offsetWidth
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  cursor: `pointer`,
})

const droppableStyle = makeStyle({
  outline: dropBorder,
})

const cardStyle = makeStyle({
  position: `absolute`,
  cursor: `default`,
})