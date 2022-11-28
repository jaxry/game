import Component from './Component'
import PermutationCard from './PermutationCard'
import { Permutation, permutationProduct } from '../../symmetricGroup'
import makeDraggable from '../makeDraggable'
import { makeStyle } from '../makeStyle'
import { cardSpawnerDragAndDrop } from '../dragAndDroppables'
import { numToPx } from '../../util'

export default class CardTableMat extends Component {
  lastHovered: Element | null = null
  elemToCard = new WeakMap<Element, PermutationCard>()

  constructor () {
    super()
    this.element.classList.add(containerStyle)

    cardSpawnerDragAndDrop.drop(this.element, (permutation, event) => {
      const rect = this.element.getBoundingClientRect()
      if (this.lastHovered) {
        const existingCard = this.elemToCard.get(this.lastHovered)!
        existingCard.remove()
        permutation = permutationProduct(existingCard.permutation, permutation)
      }
      this.makeCard(permutation, event.clientX - rect.x, event.clientY - rect.y)
    })
  }

  makeCard (permutation: Permutation, positionX: number, positionY: number) {
    const card = this.newComponent(PermutationCard, permutation)
    card.element.classList.add(cardStyle)
    this.elemToCard.set(card.element, card)
    this.element.append(card.element)

    const rect = card.element.getBoundingClientRect()
    const x = positionX - rect.width / 2
    const y = positionY - rect.height / 2
    card.element.style.transform = `translate(${numToPx(x)}, ${numToPx(y)})`

    makeDraggable(card.element, {
      onDown: (e) => {
        const rect = this.element.getBoundingClientRect()
        const cardRect = card.element.getBoundingClientRect()
        const diffX = rect.x + e.clientX - cardRect.x
        const diffY = rect.y + e.clientY - cardRect.y
        card.element.style.pointerEvents = `none`
        card.element.parentElement?.append(card.element)
        return (e) => {
          const x = e.clientX - diffX
          const y = e.clientY - diffY
          card.element.style.transform =
              `translate(${numToPx(x)}, ${numToPx(y)})`
        }
      },
      onUp: (e) => {
        card.element.style.pointerEvents = ``
        if (this.lastHovered && this.lastHovered !== card.element) {
          const otherCard = this.elemToCard.get(this.lastHovered)!
          const rect = this.element.getBoundingClientRect()
          this.multiply(otherCard, card, e.clientX - rect.x, e.clientY - rect.y)
        }
      },
    })

    card.element.addEventListener('mouseenter', () => {
      this.lastHovered = card.element
    })
    card.element.addEventListener('mouseleave', () => {
      this.lastHovered = null
    })

    return card
  }

  multiply (
      card1: PermutationCard, card2: PermutationCard, x: number, y: number) {
    card1.remove()
    card2.remove()
    const productPermutation =
        permutationProduct(card1.permutation, card2.permutation)
    this.makeCard(productPermutation, x, y)
  }
}

const containerStyle = makeStyle({
  position: `relative`,
})

const cardStyle = makeStyle({
  position: `absolute`,
  display: `inline-block`,
})