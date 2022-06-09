import Component from './Component'
import { game } from '../../Game'
import style from './Time.module.css'

export default class TimeComponent extends Component {
  constructor () {
    super()

    this.element.classList.add(style.time)

    const setTime = () => {
      this.element.textContent = game.time.getTimeOfDay()
    }

    this.on(game.event.playerTickEnd, () => setTime())
    setTime()
  }
}