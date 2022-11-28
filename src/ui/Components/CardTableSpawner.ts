import Component from './Component'
import PermutationCard from './PermutationCard'
import { s4Permutations } from '../../symmetricGroup'
import { makeStyle } from '../makeStyle'
import { cardSpawnerDragAndDrop } from '../dragAndDroppables'

export default class CardTableSpawner extends Component {
  constructor () {
    super()

    this.element.classList.add(containerStyle)

    for (const permutation of s4Permutations) {
      const card = this.newComponent(PermutationCard, permutation)
      this.element.appendChild(card.element)

      cardSpawnerDragAndDrop.drag(card.element, permutation)
    }
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  flexWrap: `wrap`,
  gap: `1rem`,
})