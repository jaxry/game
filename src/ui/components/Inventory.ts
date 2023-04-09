import Effect from '../../behavior/Effect'
import { game } from '../../Game'
import GameObject from '../../GameObject'
import ObjectCard from './ObjectCard'
import { setPlayerEffect } from '../../behavior/core'
import {
  copy, getAndDelete, isEqual, makeOrGet, moveToTop, numToPx, translate,
} from '../../util'
import { dragAndDropGameObject } from './GameUI'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import TransferAction from '../../actions/Transfer'
import makeDraggable from '../makeDraggable'
import { duration } from '../theme'
import CardPhysics from '../game/CardPhysics'
import tween, { Tween } from '../tween'
import throttle from '../throttle'

export default class Inventory extends GameComponent {
  onResize?: (xDiff: number, yDiff: number) => void

  private objectToCard = new Map<GameObject, ObjectCard>()
  private bounds = new Bounds()
  private lastBounds = new Bounds()
  private targetBounds = new Bounds()
  private tween?: Tween
  private updatePositions = throttle(() => {
    this.updateBounds()

    if (!this.tween) {
      Object.assign(this.bounds, this.targetBounds)
    }

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
        this.on(this.object, 'enter', ({ item }) => {
          self.objectEnter(item)
        })
        this.on(this.object, 'leave', ({ item }) => {
          self.objectLeave(item)
        })
        this.on(this.object, 'itemActionStart', ({ action }) => {
          if (action.target && self.objectToCard.has(action.target)) {
            self.cardPhysics.attract(action.object, action.target)
          }
        })
        this.on(this.object, 'itemActionEnd', ({ action }) => {
          if (action.target && self.objectToCard.has(action.target)) {
            self.cardPhysics.release(action.object, action.target)
          }
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
        this.makeCard(obj, true)
      }
    }

    this.cardPhysics.simulate(true, true)

    // If component is removed, prevent onResize from being called
    // in a later animation frame
    this.onRemove(() => {
      this.onResize = undefined
    })
  }

  private makeCard (object: GameObject, init?: boolean) {
    if (!init || object.position.x === 0 || object.position.y === 0) {
      const { x, y } = this.averageCardPosition()
      object.position.x = x + (Math.random() - 0.5)
      object.position.y = y + (Math.random() - 0.5)
    }

    const card = makeOrGet(this.objectToCard, object, () =>
        this.newComponent(this.element, ObjectCard, object))

    card.element.classList.add(cardStyle)

    card.onResized = (xDiff, yDiff) => {
      object.position.x += xDiff
      object.position.y += yDiff
      this.cardPhysics.simulate()
    }

    this.makeCardDraggable(object, card)

    return card
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

    this.cardPhysics.simulate(true)
    this.animateBounds()

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

  private makeCardDraggable (object: GameObject, card: ObjectCard) {
    let relX = 0
    let relY = 0

    makeDraggable(card.element, {
      onDown: (e) => {
        const { left, top, width, height }
            = card.element.getBoundingClientRect()

        relX = (e.clientX - left - width / 2) / this.scale()
        relY = (e.clientY - top - height / 2) / this.scale()

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

  private updateBounds () {
    this.targetBounds.reset()

    for (const [object, card] of this.objectToCard) {
      const x = object.position.x
      const y = object.position.y
      const w = card.element.offsetWidth / 2
      const h = card.element.offsetHeight / 2
      this.targetBounds.extendLeft(x - w)
      this.targetBounds.extendRight(x + w)
      this.targetBounds.extendTop(y - h)
      this.targetBounds.extendBottom(y + h)
    }
    this.targetBounds.setMinSize(16)
    this.targetBounds.expand(16)
  }

  private animateBounds () {
    if (this.tween) {
      return
    }

    this.updateBounds()
    if (isEqual(this.bounds, this.targetBounds)) {
      return
    }

    const start = copy(this.bounds)

    this.tween = tween((lerp) => {
      this.bounds.left = lerp(start.left, this.targetBounds.left)
      this.bounds.top = lerp(start.top, this.targetBounds.top)
      this.bounds.right = lerp(start.right, this.targetBounds.right)
      this.bounds.bottom = lerp(start.bottom, this.targetBounds.bottom)
      this.updatePositions()
    }, {
      duration: duration.slow,
    })

    this.tween.onfinish = () => {
      this.tween = undefined
    }
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

class Bounds {
  left = 0
  right = 0
  top = 0
  bottom = 0

  reset () {
    this.left = Infinity
    this.top = Infinity
    this.right = -Infinity
    this.bottom = -Infinity
  }

  expand (amount: number) {
    this.left -= amount
    this.top -= amount
    this.right += amount
    this.bottom += amount
  }

  setMinSize (size: number) {
    this.left = Math.min(isFinite(this.left) ? this.left : 0, -size)
    this.top = Math.min(isFinite(this.top) ? this.top : 0, -size)
    this.right = Math.max(isFinite(this.right) ? this.right : 0, size)
    this.bottom = Math.max(isFinite(this.bottom) ? this.bottom : 0, size)
  }

  extendLeft (x: number) {
    this.left = Math.min(this.left, x)
  }

  extendTop (y: number) {
    this.top = Math.min(this.top, y)
  }

  extendRight (x: number) {
    this.right = Math.max(this.right, x)
  }

  extendBottom (y: number) {
    this.bottom = Math.max(this.bottom, y)
  }

  width () {
    return this.right - this.left
  }

  height () {
    return this.bottom - this.top
  }
}

const containerStyle = makeStyle({
  contain: `strict`,
  position: `relative`,
  cursor: `pointer`,
})

const cardStyle = makeStyle({
  position: `absolute`,
  cursor: `default`,
})