import Component from './Component'
import { createElement } from '../createElement'
import { permutationProduct, s4Permutations } from '../../symmetricGroup'
import { makeStyle } from '../makeStyle'
import { backgroundColor } from '../theme'

export default class CayleyTable extends Component {
  constructor () {
    super(document.createElement('table'))
  }

  override onInit () {
    this.element.classList.add(tableStyle)

    const header = createElement(this.element, 'tr')

    // skip identity element
    const permutations = s4Permutations.slice(1)

    createElement(header, 'td')
    for (const p of permutations) {
      createElement(header, 'th', cellStyle, p.name)
    }

    for (const p of permutations) {
      const row = createElement(this.element, 'tr')
      createElement(row, 'th', cellStyle, p.name)
      for (const q of permutations) {
        createElement(row, 'td', cellStyle, permutationProduct(p, q).name)
      }
    }

  }
}

const tableStyle = makeStyle({
  width: `max-content`,
  borderCollapse: `collapse`,
})

const cellStyle = makeStyle({
  border: `1px solid ${backgroundColor.addL(25)}`,
  padding: `0.5rem 0.3rem`,
  textAlign: `center`,
})