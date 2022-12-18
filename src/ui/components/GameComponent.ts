import Component from './Component'
import Effect from '../../behavior/Effect'
import { Constructor } from '../../types'

export default class GameComponent extends Component {
  newEffect<T extends Constructor<Effect>> (
      constructor: T,
      ...args: ConstructorParameters<T>) {

    const effect = new constructor(...args).activate()
    this.onRemove(() => {
      effect.deactivate()
    })
    return effect
  }
}