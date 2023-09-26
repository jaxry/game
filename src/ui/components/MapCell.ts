import Component from '../../util/Component.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import { mapCellColor, mapCenterColor } from '../theme.ts'
import Entity from '../../Entity.ts'
import { game } from '../../main.ts'
import { componentEffect } from '../componentEffect.ts'
import Effect from '../../effects/Effect.ts'
import { numberOfChildren } from '../../logic/container.ts'

export default class MapCell extends Component {
  constructor (public zone: Entity) {
    super()
  }

  override onInit () {
    this.style(componentStyle)

    const setCenter = () => {
      this.element.classList.toggle(centerStyle, game.viewedZone === this.zone)
    }
    setCenter()
    this.on(game.viewedZoneChanged, setCenter)

    const update = () => {
      this.element.textContent = numberOfChildren(this.zone).toString()
    }

    update()

    componentEffect(this, class extends Effect {
      override events () {
        this.onEntityChildren('enter', update)
        this.onEntityChildren('leave', update)
      }
    }).activate(this.zone)
  }

}
const componentStyle = makeStyle({
  height: `100%`,
  background: mapCellColor,
})

const centerStyle = makeStyle({
  background: mapCenterColor,
})