import GameObject from '../../GameObject'
import { isPlayer } from '../../behavior/player'
import Action from '../../behavior/Action'
import ActionComponent from './ActionComponent'
import { game } from '../../Game'
import Effect from '../../behavior/Effect'
import TargetActionAnimation from './TargetActionAnimation'
import {
  borderRadius, boxShadow, duration, objectCardColor, objectCardNameBorderColor,
  objectCardPlayerColor,
} from '../theme'
import { makeStyle } from '../makeStyle'
import GameComponent from './GameComponent'
import DummyElement from '../DummyElement'
import { dragAndDropGameObject } from './GameUI'

const objectToCard = new WeakMap<GameObject, ObjectCard>()

export default class ObjectCard extends GameComponent {
  private actionComponent?: ActionComponent
  private targetActionAnimation?: TargetActionAnimation

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

    // this.element.addEventListener('click', () => {
    //   if (isPlayer(object)) {
    //     return
    //   }
    //   this.newComponent(ObjectInfo, object,
    //       this.element.getBoundingClientRect())
    // })

    dragAndDropGameObject.drag(this.element, object, name)

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
          self.targetActionAnimation?.exit()
          self.clearAction()
        })
      }
    }, object)
  }

  enter () {
    new DummyElement(this.element).growWidthFirst()

    this.element.animate({
      opacity: [0, 1],
      transform: [`translate(0,100%)`, `translate(0,0)`],
    }, {
      easing: 'ease-out',
      duration: duration.normal,
      delay: duration.normal,
      fill: 'backwards',
    })
  }

  exit () {
    new DummyElement(this.element).shrinkHeightFirst()

    this.element.animate({
      opacity: 0,
      transform: `translate(0,100%)`,
    }, {
      easing: 'ease-in',
      duration: duration.normal,
    }).onfinish = () => {
      this.remove()
    }
  }

  private setAction (action: Action) {
    this.clearAction()
    const component = this.newComponent(ActionComponent, action)
    this.actionComponent = component
    this.element.append(component.element)

    new DummyElement(component.element).growHeightOnly()
  }

  private clearAction () {
    if (!this.actionComponent) {
      return
    }
    const component = this.actionComponent
    this.actionComponent = undefined

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
  overflow: `hidden`,
  width: `10rem`,
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
  padding: `0.25rem`,
  background: objectCardColor,
  boxShadow,
  borderRadius,
  userSelect: `none`,
  textTransform: `capitalize`,
})

const nameStyle = makeStyle({
  width: `100%`,
  textAlign: `center`,
  borderBottom: `2px solid ${objectCardNameBorderColor}`,
})

const playerStyle = makeStyle({
  background: objectCardPlayerColor,
})