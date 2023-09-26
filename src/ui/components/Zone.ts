import Component from '../../util/Component.ts'
import Entity from '../../Entity.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import EntityInventory from './EntityInventory.ts'
import Log from './Log.ts'

export default class Zone extends Component {
  constructor (public zone: Entity) {
    super()
  }

  override onInit () {
    this.style(componentStyle)

    this.newComponent(EntityInventory, this.zone)
        .style(cardListStyle).appendTo(this.element)

    this.newComponent(Log, this.zone)
        .style(logStyle).appendTo(this.element)
  }
}

const componentStyle = makeStyle({
  display: 'flex',
  overflow: 'hidden',
  flex: `1 1 0`,
})

const cardListStyle = makeStyle({
  flex: `1 1 0`,
  overflow: `auto`,
})

const logStyle = makeStyle({
  flex: `0 1 40%`,
  overflow: `auto`,
})