import Component from './Component'
import { addStyle, makeStyle } from '../makeStyle'
import { borderRadius } from '../theme'
import colors from '../colors'
import { Permutation } from '../../symmetricGroup'

export default class PermutationCard extends Component {
  constructor (public permutation: Permutation) {
    super()
  }

  override onInit () {
    this.element.classList.add(containerStyle)
    this.element.textContent = this.permutation.name
  }

  select (selected = true) {
    this.element.classList.toggle(selectedStyle, selected)
  }
}

const containerStyle = makeStyle({
  background: colors.green['900'],
  padding: `1rem`,
  border: `2px solid ${colors.green['600']}`,
  borderRadius,
  userSelect: `none`,
})

const selectedStyle = makeStyle({
  backgroundColor: colors.lime[600],
})

addStyle(`.${containerStyle}:hover:not(.${selectedStyle})`, {
  background: colors.green['800'],
})

