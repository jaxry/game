import GameObject from '../../GameObject'
import { isPlayer } from '../../behavior/player'
import Action from '../../behavior/Action'
import ActionComponent from './ActionComponent'
import { game } from '../../Game'
import Effect from '../../behavior/Effect'
import {
  borderRadius, boxShadow, objectCardColor, objectCardNameBorderColor,
  objectCardPlayerColor,
} from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import { onClickNotDrag } from '../makeDraggable'
import Inventory from './Inventory'
import { onResize } from '../onResize'
import { dragAndDropGameObject } from './GameUI'
import { createDiv } from '../create'
import { grow, growDynamic, shrink } from '../smoothDom'

export default class ObjectCard extends GameComponent {
  onResized?: (xDiff: number, yDiff: number) => void
  private name = createDiv(this.element, nameStyle)
  private expandedContainer?: HTMLDivElement

  private action?: ActionComponent
  private inventory?: Inventory

  constructor (public object: GameObject) {
    super()

    this.element.classList.add(containerStyle)

    if (isPlayer(object)) {
      this.element.classList.add(playerStyle)
    }
    this.on(game.event.playerChange, () => {
      if (isPlayer(object)) {
        this.element.classList.add(playerStyle)
      } else {
        this.element.classList.remove(playerStyle)
      }
    })

    this.name.textContent = object.type.name

    if (object.activeAction) {
      this.setAction(object.activeAction)
    }

    onClickNotDrag(this.element, (e) => {
      e.stopPropagation()
      if (this.expandedContainer) {
        this.close()
      } else {
        this.expand()
      }
    })

    onResize(this.element, () => {
      this.onResized?.(0, 0)
    })

    const self = this
    this.newEffect(class extends Effect {
      override events () {
        this.on(object.container, 'leave', ({ item }) => {
          if (item === this.object) {
            this.reregisterEvents()
          }
        })
        this.on(object.container, 'itemActionStart', ({ action }) => {
          if (action.object !== this.object) {
            return
          }

          self.setAction(action)
        })

        this.on(object.container, 'itemActionEnd', ({ action }) => {
          if (action.object !== this.object) {
            return
          }
          self.clearAction()
        })
      }
    }, object)
  }

  expand () {
    if (this.expandedContainer) {
      return
    }
    this.expandedContainer = createDiv(this.element)

    const grab = createDiv(this.expandedContainer, undefined, 'Grab')
    dragAndDropGameObject.drag(grab, this.object, this.name)

    this.addInventory()

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

  private addInventory () {
    if (this.inventory || !this.object.contains) {
      return
    }
    this.inventory =
        this.newComponent(this.expandedContainer!, Inventory, this.object)

    this.inventory!.onResize = this.onResized
  }

  private removeInventory () {
    this.inventory?.remove()
    this.inventory = undefined
  }

  private setAction (action: Action) {
    this.clearAction()

    const component = this.newComponent(this.element, ActionComponent, action)
    this.action = component

    grow(component.element)
  }

  private clearAction () {
    if (!this.action) {
      return
    }
    const component = this.action
    this.action = undefined

    shrink(component.element).onfinish = () => {
      component.remove()
    }
  }
}

const containerStyle = makeStyle({
  contain: `content`,
  width: `max-content`, // don't make card scrunch up in small containers
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
  padding: `0.25rem`,
  background: objectCardColor,
  boxShadow,
  borderRadius,
  userSelect: `none`,
})

const nameStyle = makeStyle({
  width: `100%`,
  textAlign: `center`,
  borderBottom: `2px solid ${objectCardNameBorderColor}`,
  textTransform: `capitalize`,
})

const playerStyle = makeStyle({
  background: objectCardPlayerColor,
})