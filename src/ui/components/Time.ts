import Component from './Component'
import { game } from '../../Game'

export default class TimeComponent extends Component {
  constructor () {
    super()

    this.element.classList.add('text-center', 'text-2xl')

    const setTime = () => {
      this.element.textContent = game.time.getTimeOfDay()
    }

    this.on(game.event.playerTickEnd, () => setTime())
    setTime()
  }
}