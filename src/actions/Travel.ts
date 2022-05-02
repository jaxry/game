import Action from '../behavior/Action'
import { connectionDistance } from '../behavior/connections'
import { putInsideContainer } from '../behavior/container'
import type { GameObject } from '../GameObject'

export default class TravelAction extends Action {
  constructor(object: GameObject, public location: GameObject) {
    super(object)
    this.time = Math.round(
        3 * connectionDistance(object.container, location),
    )
  }

  override get name() { return 'travel' }

  override get icon() { return '🥾' }

  override do() {
    putInsideContainer(this.location, this.object)
  }
}
