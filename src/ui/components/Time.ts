import Component from './Component'
import { game } from '../../Game'
import { makeStyle } from '../makeStyle'

export default class TimeComponent extends Component {
  constructor () {
    super()

    this.element.classList.add(timeStyle)

    const setTime = () => {
      this.element.textContent = game.time.getTimeOfDay()
    }

    this.on(game.event.tick, () => setTime())
    setTime()
  }
}

const timeStyle = makeStyle({
  fontSize: `2rem`,
  textAlign: `center`,
})