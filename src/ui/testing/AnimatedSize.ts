import Component from '../components/Component'
import { makeStyle } from '../makeStyle'
import { createDiv } from '../createElement'
import { onResize } from '../onResize'
import { getAndDelete, numToPx } from '../../util'
import { duration } from '../theme'

const removing = new WeakMap<Element, NodeJS.Timeout>()

export default class AnimatedSize extends Component {
  content = createDiv(this.element, contentStyle)

  constructor () {
    super()

    this.element.classList.add(containerStyle)

    onResize(this.content, (width, height) => {
      this.element.animate({
        width: [
          numToPx(this.element.offsetWidth), numToPx(width)],
        height: [
          numToPx(this.element.offsetHeight), numToPx(height)],
      }, {
        duration: duration.normal,
        easing: `ease`,
        fill: `forwards`,
      })
    })
  }

  animatedRemove (element: HTMLElement, onFinish: () => void) {
    const { offsetLeft, offsetTop, } = element

    element.style.position = `absolute`
    element.style.left = numToPx(offsetLeft)
    element.style.top = numToPx(offsetTop)

    removing.set(element, setTimeout(() => {
      onFinish()
    }, duration.normal))
  }

  cancelAnimatedRemove (element: HTMLElement) {
    const id = getAndDelete(removing, element)

    clearTimeout(id)

    element.style.position = ``
    element.style.left = ``
    element.style.top = ``
  }
}

const containerStyle = makeStyle({
  position: `absolute`,
  overflow: `hidden`,
})

const contentStyle = makeStyle({
  position: `absolute`,
})