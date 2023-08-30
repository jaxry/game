import Component from './Component'
import PermutationCard from './PermutationCard'
import { Permutation, permutationProduct } from '../../symmetricGroup'
import makeDraggable from '../makeDraggable'
import { makeStyle } from '../makeStyle'
import { cardSpawnerDragAndDrop } from '../dragAndDroppables'
import { px } from '../../util'

export default class CardTableMat extends Component {
  lastHovered: Element | null = null
  elemToCard = new WeakMap<Element, PermutationCard>()

  override onInit () {
    this.element.classList.add(containerStyle)

    cardSpawnerDragAndDrop.drop(this.element, {
      isDroppable: () => 'copy',
      onDrop: (permutation, event) => {
        const rect = this.element.getBoundingClientRect()
        if (this.lastHovered) {
          const existingCard = this.elemToCard.get(this.lastHovered)!
          existingCard.remove()
          permutation =
              permutationProduct(existingCard.permutation, permutation)
        }
        this.makeCard(permutation, event.clientX - rect.x,
            event.clientY - rect.y)
      },
    })
  }

  makeCard (permutation: Permutation, positionX: number, positionY: number) {
    const card = this.newComponent(PermutationCard, permutation)
        .appendTo(this.element)
    card.element.classList.add(cardStyle)
    this.elemToCard.set(card.element, card)

    const rect = card.element.getBoundingClientRect()
    const x = positionX - rect.width / 2
    const y = positionY - rect.height / 2
    card.element.style.transform = `translate(${px(x)}, ${px(y)})`

    let diffX = 0
    let diffY = 0
    makeDraggable(card.element, {
      onDown: (e) => {
        const rect = this.element.getBoundingClientRect()
        const cardRect = card.element.getBoundingClientRect()
        diffX = -rect.x + cardRect.x - e.clientX
        diffY = -rect.y + cardRect.y - e.clientY
        card.element.style.pointerEvents = `none`
        card.element.parentElement?.append(card.element)
      },
      onDrag: (e) => {
        const x = e.clientX + diffX
        const y = e.clientY + diffY
        card.element.style.transform =
            `translate(${px(x)}, ${px(y)})`
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