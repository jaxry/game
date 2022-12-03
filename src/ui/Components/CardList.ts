import Component from './Component'
import {
  Permutation, permutationProduct, s4Permutations,
} from '../../symmetricGroup'
import PermutationCard from './PermutationCard'
import { makeStyle } from '../makeStyle'

export default class CardList extends Component {

  list = document.createElement('div')
  products = document.createElement('div')

  inputCards: PermutationCard[] = []
  productCards: PermutationCard[] = []

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    this.element.append(this.list)

    const listLabel = document.createElement('div')
    listLabel.textContent = 'Input'
    this.list.append(listLabel)

    this.element.append(this.products)

    const productsLabel = document.createElement('div')
    productsLabel.textContent = 'Product'
    this.products.append(productsLabel)

    for (const permutation of s4Permutations) {
      this.makeCard(permutation)
    }
    this.select(this.inputCards[0])
  }

  private makeCard(permutation: Permutation) {
    const card = this.newComponent(PermutationCard, permutation)
    this.inputCards.push(card)

    card.element.addEventListener('click', () => {
      this.select(card)
    })

    this.list.appendChild(card.element)
  }

  private select(card: PermutationCard) {
    this.clearProducts()

    card.select()

    for (const other of s4Permutations) {
      const product = permutationProduct(card.permutation, other)

      const productCard = this.newComponent(PermutationCard, product)

      productCard.element.addEventListener('click', () => {
        this.clickedPermutation(product)
      })

      this.productCards.push(productCard)
      this.products.appendChild(productCard.element)
    }
  }

  private clickedPermutation(permutation: Permutation) {
    for (const card of this.inputCards) {
      if (card.permutation === permutation) {
        this.select(card)
        return
      }
    }
  }

  private clearProducts() {
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
  height: `100%`
})
