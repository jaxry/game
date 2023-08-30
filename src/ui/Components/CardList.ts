import Component from './Component'
import {
  Permutation, permutationProduct, s4Permutations,
} from '../../symmetricGroup'
import PermutationCard from './PermutationCard'
import { makeStyle } from '../makeStyle'
import { createDiv } from '../createElement'

export default class CardList extends Component {

  list = createDiv(this.element)
  products = createDiv(this.element)

  inputCards: PermutationCard[] = []
  productCards: PermutationCard[] = []

  override onInit () {
    this.element.classList.add(containerStyle)

    createDiv(this.list, undefined, `Input`)
    createDiv(this.products, undefined, `Products`)

    for (const permutation of s4Permutations) {
      this.makeCard(permutation)
    }
    this.select(this.inputCards[0])
  }

  private makeCard (permutation: Permutation) {
    const card = this.newComponent(PermutationCard, permutation)
        .appendTo(this.list)
    this.inputCards.push(card)

    card.element.addEventListener('click', () => {
      this.select(card)
    })
  }

  private select (card: PermutationCard) {
    this.clearProducts()

    card.select()

    for (const other of s4Permutations) {
      const product = permutationProduct(card.permutation, other)

      const productCard = this.newComponent(PermutationCard, product)
          .appendTo(this.products)

      productCard.element.addEventListener('click', () => {
        this.clickedPermutation(product)
      })

      this.productCards.push(productCard)
    }
  }

  private clickedPermutation (permutation: Permutation) {
    for (const card of this.inputCards) {
      if (card.permutation === permutation) {
        this.select(card)
        return
      }
    }
  }

  private clearProducts () {
    for (const inputCard of this.inputCards) {
      inputCard.select(false)
    }
    for (const productCard of this.productCards) {
      productCard.remove()
    }
    this.productCards.length = 0
  }
}

const containerStyle = makeStyle({
  display: `flex`,
  gap: `1rem`,
  justifyContent: `center`,
  textAlign: `center`,
  overflow: `auto`,
  height: `100%`,
})
