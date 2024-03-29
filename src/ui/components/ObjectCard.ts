import GameObject, { ContainedAs } from '../../GameObject'
import {
  borderRadius, boxShadow, duration, fadeIn, fadeInKeyframes, fadeOut,
  objectCardColor, objectCardPlayerColor, objectTextColor, textColor,
} from '../theme'
import { addStyle, hoverStyle, makeStyle } from '../makeStyle'
import ActionComponent from './ActionComponent'
import animatedBackground, {
  animatedBackgroundTemplate,
} from '../animatedBackground'
import { createDiv, createElement } from '../createElement'
import animatedContents from '../animatedContents'
import { isPlayer } from '../../behavior/player'
import { cancelDrag } from '../makeDraggable'
import ObjectCardWindow from './ObjectCardWindow'
import Effect from '../../effects/Effect'
import GameComponent from './GameComponent'
import Inventory from './Inventory'
import { numberOfChildren } from '../../behavior/container'

export default class ObjectCard extends GameComponent {
  actionComponent?: ActionComponent
  holdingComponent?: Inventory

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)
    this.element.classList.toggle(playerStyle, isPlayer(this.object))

    createDiv(this.element, titleStyle, this.object.type.name)

    queueMicrotask(() => {
      this.makeHolding()
      this.showAction()
    })

    this.element.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return
      e.stopPropagation()
      this.showWindow(e.clientX, e.clientY)
    })

    this.newEffect(ObjectCardEffect, this.object, this)

    animatedBackground(this.element, backgroundStyle)
    animatedContents(this.element)
    cancelDrag(this.element)
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

  showAction () {
    const action = this.object.activeAction
    if (!action) return
    this.actionComponent =
        this.newComponent(ActionComponent, action).appendTo(this.element)
    fadeIn(this.actionComponent.element)
  }

  hideAction () {
    if (!this.actionComponent) return
    const actionComponent = this.actionComponent
    this.actionComponent = undefined
    fadeOut(actionComponent.element, () => actionComponent.remove())
  }

  makeHolding () {
    if (this.holdingComponent ||
        !numberOfChildren(this.object, ContainedAs.holding)) {
      return
    }
    this.holdingComponent = this.newComponent(Inventory, this.object,
        ContainedAs.holding).appendTo(this.element)
    this.holdingComponent.element.classList.add(holdingStyle)
    fadeIn(this.holdingComponent.element)
  }

  hideHoldingIfEmpty () {
    if (!this.holdingComponent ||
        numberOfChildren(this.object, ContainedAs.holding)) {
      return
    }
    const holdingComponent = this.holdingComponent
    this.holdingComponent = undefined
    fadeOut(holdingComponent.element, () => holdingComponent.remove())
  }
}

class ObjectCardEffect extends Effect {
  static $serialize = false

  constructor (object: GameObject, public card: ObjectCard) {
    super(object)
  }

  override events () {
    this.onObject('actionStart', () => {
      this.card.showAction()
    })
    this.onObject('actionEnd', () => {
      this.card.hideAction()
    })
    this.onObject('speak', (message) => {
      this.card.showMessage(message)
    })
    this.onObjectChildren('enter', (child) => {
      if (child.containedAs !== ContainedAs.holding) return
      this.card.makeHolding()
    })
    this.onObjectChildren('leave', (child) => {
      if (child.containedAs !== ContainedAs.holding) return
      queueMicrotask(() => {
        this.card.hideHoldingIfEmpty()
      })
    })
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  display: `flex`,
  flexDirection: `column`,
  gap: `0.2rem`,
  padding: `0.75rem`,
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