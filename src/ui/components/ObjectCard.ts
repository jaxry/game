import GameObject, { ContainedAs } from '../../GameObject'
import {
  borderRadius, boxShadow, duration, fadeIn, fadeInKeyframes, objectCardColor,
  objectCardPlayerColor, objectTextColor, textColor,
} from '../theme'
import { addStyle, hoverStyle, makeStyle } from '../makeStyle'
import ActionComponent from './ActionComponent'
import animatedBackground, {
  animatedBackgroundTemplate, fadeOutAbsolute,
} from '../animatedBackground'
import Action from '../../actions/Action'
import { createDiv, createElement } from '../createElement'
import animatedContents from '../animatedContents'
import { isPlayer } from '../../behavior/player'
import { cancelDrag } from '../makeDraggable'
import ObjectCardWindow from './ObjectCardWindow'
import Effect from '../../effects/Effect'
import GameComponent from './GameComponent'
import Inventory from './Inventory'

export default class ObjectCard extends GameComponent {
  actionComponent?: ActionComponent

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)
    this.element.classList.toggle(playerStyle, isPlayer(this.object))

    createDiv(this.element, titleStyle, this.object.type.name)

    // const holdingContainer = createDiv(this.element, holdingContainerStyle)
    const holding = this.newComponent(Inventory, this.object,
            ContainedAs.holding)
        .appendTo(this.element)
    holding.element.classList.add(holdingStyle)

    animatedBackground(this.element, backgroundStyle)
    animatedContents(this.element)
    cancelDrag(this.element)

    this.element.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return
      e.stopPropagation()
      this.showWindow(e.clientX, e.clientY)
    })

    this.newEffect(ObjectCardEffect, this.object, this)
  }

  showWindow (x: number, y: number) {
    this.newComponent(ObjectCardWindow, this.object).renderAt(x, y)
  }

  showMessage (message: string) {
    const element = createElement(this.element, 'q', messageStyle, message)
    fadeIn(element)
    element.animate({
      opacity: [`1`, `0`],
    }, {
      duration: 4000,
      easing: `ease-in`,
    }).onfinish = () => {
      element.remove()
    }
  }

  showAction (action: Action) {
    this.actionComponent =
        this.newComponent(ActionComponent, action).appendTo(this.element)
    fadeIn(this.actionComponent.element)
  }

  hideAction () {
    if (!this.actionComponent) return
    const actionComponent = this.actionComponent
    this.actionComponent = undefined
    fadeOutAbsolute(actionComponent.element, () => {
      actionComponent.remove()
    })
  }
}

class ObjectCardEffect extends Effect {
  constructor (object: GameObject, public card: ObjectCard) {
    super(object)
  }

  override events () {
    this.onObject('actionStart', (action) => {
      this.card.showAction(action)
    })
    this.onObject('actionEnd', () => {
      this.card.hideAction()
    })
    this.onObject('speak', (message) => {
      this.card.showMessage(message)
    })
    this.onObjectChildren('enter', (child) => {
      if (child.containedAs !== ContainedAs.holding) return
    })
    this.onObjectChildren('leave', (child) => {
      if (child.containedAs !== ContainedAs.holding) return
    })
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  padding: `0.5rem`,
  width: `max-content`,
  color: objectTextColor,
})
hoverStyle(containerStyle, {
  filter: `brightness(1.1)`,
})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  background: objectCardColor,
  borderRadius,
  boxShadow,
})

const playerStyle = makeStyle({})

addStyle(`.${playerStyle} > .${backgroundStyle}`, {
  background: objectCardPlayerColor,
})

const titleStyle = makeStyle({
  color: textColor,
})

const messageStyle = makeStyle({
  display: `block`,
})

const holdingStyle = makeStyle({
  paddingLeft: `1.25rem`,
})

addStyle(`.${holdingStyle}::before`, {
  content: `🖐`,
  position: `absolute`,
  top: `0`,
  left: `0`,
  animation: `${fadeInKeyframes} ${duration.normal}ms`,
})