import Component from './Component'
import { makeStyle } from '../makeStyle'
import { borderRadius } from '../theme'
import colors from '../colors'
import { Permutation } from '../../symmetricGroup'

export default class PermutationCard extends Component {
  constructor (public permutation: Permutation) {
    super()

    this.element.classList.add(containerStyle)

    const text = document.createTextNode(permutation.name)

    this.element.appendChild(text)
  }

  select(selected = true) {
    if (selected) {
      this.element.classList.add(selectedStyle)
    } else {
      this.element.classList.remove(selectedStyle)
    }
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

makeStyle(`.${containerStyle}:hover:not(.${selectedStyle})`, {
  background: colors.green['800'],
})

