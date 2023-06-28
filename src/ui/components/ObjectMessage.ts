import Component from './Component'
import { makeStyle } from '../makeStyle'
import { boxShadow, duration, objectDialogueBackground } from '../theme'

export default class ObjectMessage extends Component {
  constructor (public message: string) {
    super()

    const lifespan = 4000

    this.element.classList.add(containerStyle)

    this.element.textContent = message

    this.element.animate({
      transform: [`scale(0)`, `scale(1)`],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `add`,
    })

    this.element.animate({
      opacity: `0`,
    }, {
      duration: lifespan,
    })

    this.element.animate({
      transform: `translateY(-75%)`,
    }, {
      duration: lifespan,
      composite: `add`,
      easing: `ease`,
    }).onfinish = () => {
      this.remove()
    }
  }
}

const containerStyle = makeStyle({
  userSelect: `none`,
  position: `absolute`,
  top: `25%`,
  left: `50%`,
  transform: `translate(0, -50%)`,
  background: objectDialogueBackground,
  padding: `1rem`,
  borderRadius: `50%`,
  width: `max-content`,
  pointerEvents: `none`,
  boxShadow,
})