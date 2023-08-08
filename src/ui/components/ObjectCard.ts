import Component from './Component'
import GameObject from '../../GameObject'
import { borderRadius, duration, objectCardColor } from '../theme'
import { makeStyle } from '../makeStyle'
import ActionComponent from './ActionComponent'
import animatedBackground, {
  animatedBackgroundTemplate, fadeOutElement,
} from '../animatedBackground'

export default class ObjectCard extends Component {
  actionComponent?: ActionComponent

  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    this.element.textContent = this.object.type.name

    animatedBackground(this.element, backgroundStyle)
  }

  showAction () {
    this.actionComponent =
        this.newComponent(ActionComponent, this.object.activeAction)
            .appendTo(this.element)
    this.actionComponent.element.animate({
      opacity: [`0`, `1`],
      scale: [`0`, `1`],
    }, {
      duration: duration.normal,
      easing: `ease`,
    })
  }

  hideAction () {
    const actionComponent = this.actionComponent!
    if (!actionComponent) return
    fadeOutElement(actionComponent.element, () => {
      actionComponent.remove()
    })
  }
}

const containerStyle = makeStyle({
  position: `relative`,
  padding: `0.5rem`,
  width: `max-content`,
})

const backgroundStyle = makeStyle({
  ...animatedBackgroundTemplate,
  background: objectCardColor,
  borderRadius,
})