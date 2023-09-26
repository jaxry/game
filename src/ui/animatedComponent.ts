import Component from '../util/Component.ts'
import { duration } from './theme.ts'
import { Constructor } from '../util/types.ts'

export function animatedComponent<T extends Constructor<Component>> (
    Base: T, _: any) {
  return class extends Base {
    override onInit () {
      super.onInit?.()
      this.element.animate({
        opacity: [0, 1],
        scale: [0.5, 1],
      }, {
        duration: duration.short,
        easing: 'ease',
      })
    }

    override remove () {
      super.remove(false)
      this.element.animate({
        opacity: [1, 0],
        scale: [1, 0.5],
      }, {
        duration: duration.short,
        easing: 'ease',
      }).onfinish = () => {
        this.element.remove()
      }
    }
  }
}