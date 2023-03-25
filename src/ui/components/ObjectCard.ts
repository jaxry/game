import GameObject from '../../GameObject'
import { isPlayer } from '../../behavior/player'
import Action from '../../behavior/Action'
import ActionComponent from './ActionComponent'
import { game } from '../../Game'
import Effect from '../../behavior/Effect'
import {
  borderRadius, boxShadow, duration, objectCardColor, objectCardNameBorderColor,
  objectCardPlayerColor,
} from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import DummyElement from '../DummyElement'
import { onClickNotDrag } from '../makeDraggable'
import Inventory from './Inventory'

const objectToCard = new WeakMap<GameObject, ObjectCard>()

export default class ObjectCard extends GameComponent {

  onInventoryResized?: (xDiff: number, yDiff: number) => void
  private action?: ActionComponent
  private inventory?: Inventory

  constructor (public object: GameObject) {
    super()

    objectToCard.set(object, this)

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

    const name = document.createElement('div')
    name.classList.add(nameStyle)
    name.textContent = object.type.name
    this.element.append(name)

    if (object.activeAction) {
      this.setAction(object.activeAction)
    }

    onClickNotDrag(this.element, () => {
      this.showInventory()
    })

    // dragAndDropGameObject.drag(this.element, object, name)

    const self = this
    this.newEffect(class extends Effect {
      override tick () {
      }

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

  showInventory () {
    if (this.inventory || !this.object.contains) {
      return
    }
    this.inventory = this.newComponent(Inventory, this.object)
    this.inventory.onResize = this.onInventoryResized
    this.element.append(this.inventory.element)
  }

  private setAction (action: Action) {
    this.clearAction()
    const component = this.newComponent(ActionComponent, action)
    this.action = component
    this.element.append(component.element)

    new DummyElement(component.element).growHeightOnly()
  }

  private clearAction () {
    if (!this.action) {
      return
    }
    const component = this.action
    this.action = undefined

    new DummyElement(component.element).shrinkHeightOnly()
    component.element.animate({
      opacity: 0,
    }, {
      duration: duration.fast,
    }).onfinish = () => {
      component.remove()
    }
  }
}

const containerStyle = makeStyle({
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