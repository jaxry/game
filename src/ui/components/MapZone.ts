import GameObject from '../../GameObject'
import Component from './Component'
import { makeStyle } from '../makeStyle'

export default class MapZone extends Component {
  constructor (public zone: GameObject) {
    super()

    this.element.classList.add(containerStyle)
    this.element.textContent = 'hi hi'
  }
}

const containerStyle = makeStyle({

})