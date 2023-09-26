import Component from '../../util/Component.ts'
import Entity from '../../Entity.ts'
import { createDiv } from '../../util/createElement.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import { entityElement } from '../entityElement.ts'
import { entityBackgroundColor } from '../theme.ts'
import ActionDisplay from './ActionDisplay.ts'

export default class EntityCard extends Component {
  constructor (public entity: Entity) {
    super()
  }

  override onInit () {
    this.style(componentStyle)

    this.element.style.background =
        entityBackgroundColor(this.entity).toString()

    createDiv(this.element, undefined, this.entity.name)

    this.newComponent(ActionDisplay, this.entity).appendTo(this.element)

    entityElement(this, this.element, this.entity)
  }
}

const componentStyle = makeStyle({})