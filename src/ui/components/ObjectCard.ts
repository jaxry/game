import Component from './Component'
import GameObject from '../../GameObject'
import {
  borderRadius, boxShadow, fadeIn, objectCardColor, objectCardPlayerColor,
  objectSpeakColor,
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

export default class ObjectCard extends Component {
  title = createDiv(this.element)
  actionComponent?: ActionComponent

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)
    this.element.classList.toggle(playerStyle, isPlayer(this.object))

    this.title.textContent = this.object.type.name

    animatedBackground(this.element, backgroundStyle)
    animatedContents(this.element)
    cancelDrag(this.element)

    this.element.addEventListener('pointerdown', (e) => {
      this.showWindow(e.clientX, e.clientY)
    })
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
    const actionComponent = this.actionComponent!
    if (!actionComponent) return
    fadeOutAbsolute(actionComponent.element, () => {
      actionComponent.remove()
    })
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  padding: `0.5rem`,
  width: `max-content`,
})

hoverStyle(containerStyle, {
  filter: `brightness(1.1)`,
})

const playerStyle = makeStyle({})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  background: objectCardColor,
  borderRadius,
  boxShadow,
})

addStyle(`.${playerStyle} > .${backgroundStyle}`, {
  background: objectCardPlayerColor,
})

const messageStyle = makeStyle({
  display: `block`,
  color: objectSpeakColor,
})