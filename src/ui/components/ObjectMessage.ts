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
      opacity: [`0`, `1`],
    }, {
      duration: duration.normal,
      easing: `ease`,
    })

    this.element.animate({
      opacity: `0`,
    }, {
      duration: lifespan - duration.normal,
      delay: duration.normal,
      easing: `ease-in`,
    })

    this.element.animate({
      transform: `translateY(-50%) scale(0.8)`,
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