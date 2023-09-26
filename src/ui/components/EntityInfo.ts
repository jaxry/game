import { makeStyle } from '../../util/makeStyle.ts'
import Component from '../../util/Component.ts'
import Entity from '../../Entity.ts'
import { createDiv, createElement } from '../../util/createElement.ts'
import { buttonStyle, windowTheme } from '../theme.ts'
import EntityInventory from './EntityInventory.ts'
import ActionDisplay from './ActionDisplay.ts'
import { makeMaterializer } from '../../initGame.ts'

export default class EntityInfo extends Component {
  constructor (public entity: Entity, private full = false) {
    super()
  }

  override onInit () {
    this.style(componentStyle)

    createDiv(this.element, undefined, this.entity.name)

    this.newComponent(ActionDisplay, this.entity).appendTo(this.element)

    if (this.full) {
      const spawn = createElement(this.element, 'button', buttonStyle,
          'Materializer')
      spawn.addEventListener('click', () => makeMaterializer(this.entity))
    }

    this.newComponent(EntityInventory, this.entity).appendTo(this.element)
  }
}

const componentStyle = makeStyle({
  ...windowTheme,
  maxWidth: `50vw`,
})