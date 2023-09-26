import Component from '../../util/Component.ts'
import Entity from '../../Entity.ts'
import { createDiv } from '../../util/createElement.ts'
import { makeStyle } from '../../util/makeStyle.ts'
import { entityElement } from '../entityElement.ts'
import { entityBackgroundColor } from '../theme.ts'
import ActionDisplay from './ActionDisplay.ts'

export default class EntityCard extends Component {
  public anchor: HTMLElement

  constructor (public entity: Entity) {
    super()
  }

  override onInit () {
    this.style(componentStyle)

    this.newComponent(ActionDisplay, this.entity).appendTo(this.element)

    const info = createDiv(this.element, infoStyle)
    info.style.background = entityBackgroundColor(this.entity).toString()
    createDiv(info, undefined, this.entity.name)

    this.anchor = info

    entityElement(this, this.element, this.entity)
  }
}

const componentStyle = makeStyle({
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
})

const infoStyle = makeStyle({
  borderRadius: `4px`,
  padding: `1rem`,
  textAlign: `center`,
  boxShadow: `0 0 4px #0004`,
})