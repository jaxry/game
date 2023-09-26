import Component from '../../util/Component.ts'
import { game } from '../../main'

export default class TimeComponent extends Component {
  override onInit () {
    const setTime = () => {
      this.element.textContent = game.time.getHourOfDay()
    }

    setTime()

    this.on(game.tick, setTime)
  }
}
