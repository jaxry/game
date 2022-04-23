import Component from './Component'
import { GameObject } from '../../GameObject'
import style from './ObjectCard.module.css'
import { isPlayer } from '../../behavior/player'
import ObjectInfo from './ObjectInfo'

export default class ObjectCard extends Component {
  constructor(object: GameObject) {
    super()

    this.element.classList.add(style.container)

    if (isPlayer(object)) {
      this.element.classList.add(style.player)
    }

    this.element.textContent = object.type.name

    this.element.addEventListener('click', () => {
      const info = this.newComponent(ObjectInfo, object,
          this.element.getBoundingClientRect())
      info.exit = () => this.removeComponent(info)
    })
  }
}