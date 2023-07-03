import GameObject from '../../GameObject'
import { getPlayerActions, isPlayer } from '../../behavior/player'
import Action from '../../actions/Action'
import ActionComponent from './ActionComponent'
import { game } from '../../Game'
import {
  actionColor, borderRadius, boxShadow, buttonStyle, duration, fadeInAnimation,
  objectCardColor, objectCardPlayerColor,
} from '../theme'
import { addStyle, makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import { onClickNotDrag } from '../makeDraggable'
import Inventory from './Inventory'
import { onResize } from '../onResize'
import { dragAndDropGameObject } from './GameUI'
import { createDiv, createElement } from '../createElement'
import { grow, growDynamic, shrink } from '../growShrink'
import ObjectMessage from './ObjectMessage'
import { castArray, moveToTop } from '../../util'

export const objectToCard = new WeakMap<GameObject, ObjectCard>()

export default class ObjectCard extends GameComponent {
  onResize?: (xDiff: number, yDiff: number) => void
  private name = createDiv(this.element, nameStyle)
  private expandedContainer?: HTMLDivElement

  private actionComponent?: ActionComponent
  private inventory?: Inventory
  private targetedByAction = new Set<Action>()

  constructor (public object: GameObject) {
    super()

    objectToCard.set(object, this)
    this.onRemove(() => {
      if (objectToCard.get(object) === this) {
        objectToCard.delete(object)
      }
    })

    this.element.classList.add(containerStyle)

    this.element.classList.toggle(playerStyle, isPlayer(object))

    this.on(game.event.playerChange, () => {
      this.element.classList.toggle(playerStyle, isPlayer(object))
    })

    this.name.textContent = object.type.name

    const grab = createDiv(this.element, grabStyle, `🫳`)
    dragAndDropGameObject.drag(grab, this.object, this.name)

    // delay a frame so animation starts correctly
    requestAnimationFrame(() => {
      if (object.activeAction) {
        this.setAction(object.activeAction)
      }
    })

    onClickNotDrag(this.element, (e) => {
      e.stopPropagation()
      if (this.expandedContainer) {
        this.close()
      } else {
        this.expand()
      }
    })

    onResize(this.element, () => {
      this.onResize?.(0, 0)
    })
  }

  expand () {
    if (this.expandedContainer) {
      return
    }
    this.expandedContainer = createDiv(this.element)

    if (this.object.energy) {
      createDiv(this.expandedContainer, undefined,
          `Energy: ${this.object.energy}`)
    }

    const actionButtons = createDiv(this.expandedContainer)
    for (const action of getPlayerActions(this.object)) {
      const button = createElement(
          actionButtons, 'button', buttonStyle, action.constructor.name)
      button.addEventListener('click', () => {
        action.activate()
      })
    }

    this.addInventory(this.expandedContainer)

    growDynamic(this.expandedContainer)
  }

  close () {
    if (!this.expandedContainer) {
      return
    }
    shrink(this.expandedContainer).onfinish = () => {
      this.removeInventory()
      this.expandedContainer?.remove()
      this.expandedContainer = undefined
    }
  }

  speak (message: string) {
    this.newComponent(ObjectMessage, message).appendTo(this.element)
    moveToTop(this.element)
  }

  targetByAction (action: Action) {
    this.targetedByAction.add(action)
    this.element.classList.toggle(actionTargetStyle,
        this.targetedByAction.size > 0)
  }

  clearTargetByAction (action: Action) {
    this.targetedByAction.delete(action)
    this.element.classList.toggle(actionTargetStyle,
        this.targetedByAction.size > 0)
  }

  setAction (action: Action) {
    this.clearAction()

    this.actionComponent = this.newComponent(ActionComponent, action)
        .appendTo(this.element)

    for (const target of castArray(action.target)) {
      if (objectToCard.has(target)) {
        objectToCard.get(target)!.targetByAction(action)
      }
    }

    grow(this.actionComponent.element)
  }

  clearAction () {
    if (!this.actionComponent) {
      return
    }

    const action = this.actionComponent.action

    for (const target of castArray(action.target)) {
      if (objectToCard.has(target)) {
        objectToCard.get(target)!.clearTargetByAction(action)
      }
    }

    const component = this.actionComponent
    this.actionComponent = undefined

    shrink(component.element).onfinish = () => {
      component.remove()
    }
  }

  private addInventory (container: Element) {
    if (this.inventory || !this.object.contains) {
      return
    }
    this.inventory = this.newComponent(Inventory, this.object)
        .appendTo(container)
    this.inventory!.onResize = this.onResize
  }

  private removeInventory () {
    this.inventory?.remove()
    this.inventory = undefined
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  width: `max-content`,
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
  padding: `0.25rem`,
  background: objectCardColor,
  boxShadow,
  borderRadius,

  // for target border
  outline: `2px solid transparent`,
  transition: `outline-color ${duration.short}ms`,
})

const nameStyle = makeStyle({
  width: `100%`,
  textAlign: `center`,
})

const grabStyle = makeStyle({
  position: `absolute`,
  right: `0`,
  transform: `translate(50%, -50%) scaleX(-1) `,
  fontSize: `1.25rem`,
  cursor: `grab`,
  display: 'none',
})

const actionTargetParentStyle = makeStyle({})

const actionTargetStyle = makeStyle({
  outlineColor: actionColor,
})

addStyle(`:hover > .${grabStyle}`, {
  display: 'block',
  animation: fadeInAnimation,
})

const playerStyle = makeStyle({
  background: objectCardPlayerColor,
})

