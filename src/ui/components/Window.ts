import Component from './Component'
import { outsideElement } from './App'
import { makeStyle } from '../makeStyle'
import makeDraggable from '../makeDraggable'
import { borderRadius, boxShadowLarge, duration, windowColor } from '../theme'

export default class Window extends Component {
  posX = 0
  posY = 0
  focused = false
  removeEventsController = new AbortController()

  constructor () {
    super()
    this.element.classList.add(containerStyle)

    outsideElement.append(this.element)

    this.setupRemoveEvents()

    makeDraggable(this.element, {
      onDrag: (e) => {
        this.posX += e.movementX
        this.posY += e.movementY
        this.updatePosition()
      },
    })

    this.element.animate({
      opacity: [`0`, `1`],
      scale: [`1 0`, `1 1`],
    }, {
      duration: duration.short,
      easing: `ease`,
    })
  }

  renderAt (x: number, y: number) {
    this.onInit?.()
    this.posX = x - this.element.offsetWidth / 2
    this.posY = y - this.element.offsetHeight / 2
    this.updatePosition()
    return this
  }

  animateRemove () {
    this.removeEventsController.abort()
    this.element.animate({
      opacity: [`1`, `0`],
      scale: [`1 1`, `1 0`],
    }, {
      duration: duration.short,
      easing: `ease`,
    }).onfinish = () => {
      this.remove()
    }
  }
  
  private setupRemoveEvents () {
    const signal = this.removeEventsController.signal

    this.element.addEventListener('pointerenter', (e) => {
      for (const window of ancestorWindows(this)) {
        window.focused = true
      }
    }, { signal })

    this.element.addEventListener('pointerleave', (e) => {
      this.focused = false
      setTimeout(() => {
        for (const window of ancestorWindows(this)) {
          if (!window.focused) {
            window.animateRemove()
          }
          window.focused = false
        }
      })
    }, { signal })
  }

  private updatePosition () {
    this.element.style.translate = `${this.posX}px ${this.posY}px`
  }
}

const containerStyle = makeStyle({
  position: `fixed`,
  top: `0`,
  left: `0`,
  padding: `0.5rem`,
  background: windowColor,
  borderRadius,
  boxShadow: boxShadowLarge,
})

function* ancestorWindows (component: Component<Element>) {
  while (component) {
    if (component instanceof Window) {
      yield component
    }
    component = component.parentComponent!
  }
}