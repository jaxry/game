import Component from './Component'
import GameObject from '../../GameObject'
import { borderRadius, objectCardColor } from '../theme'
import { makeStyle } from '../makeStyle'

export default class ObjectCard extends Component {
  constructor (public object: GameObject) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)

    this.element.textContent = this.object.type.name
  }
}

const containerStyle = makeStyle({
  padding: `0.5rem`,
  background: objectCardColor,
  borderRadius,
  width: `max-content`
})