import Action from './Action'
import { putInsideContainer } from '../behavior/container'
import type GameObject from '../GameObject'
import { serializable } from '../serialize'

export default class TravelAction extends Action {
  static override duration = 3

  constructor (object: GameObject, override target: GameObject) {
    super(object)
  }

  override get name () {
    return `travel`
  }

  override do () {
    putInsideContainer(this.target, this.object)
  }
}
serializable(TravelAction)