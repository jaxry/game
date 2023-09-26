import { Constructor } from '../util/types.ts'
import Effect from '../effects/Effect.ts'
import Component from '../util/Component.ts'

export function componentEffect<T extends Constructor<Effect>> (
    component: Component, constructor: T) {
  const effect = new constructor()
  component.onRemove(() => effect.deactivate())
  return effect
}