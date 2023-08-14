import Component from './Component'
import { outsideElem } from './App'
import { makeStyle } from '../makeStyle'
import makeDraggable from '../makeDraggable'
import { borderRadius, boxShadowLarge, duration, windowColor } from '../theme'

const windows = new Set<Window>

export default class Window extends Component {
  posX = 0
  posY = 0
  clicked = false

  constructor () {
    super()
    this.element.classList.add(containerStyle)

    outsideElem.append(this.element)

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

  animateOut () {
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

  renderAt (x: number, y: number) {
    this.onInit?.()
    this.posX = x - this.element.offsetWidth / 2
    this.posY = y - this.element.offsetHeight / 2
    this.updatePosition()
    return this
  }

  private setupRemoveEvents () {
    windows.add(this)
    this.onRemove(() => windows.delete(this))

    this.element.addEventListener('pointerenter', (e) => {
      for (const window of ancestorWindows(this)) {
        window.clicked = true
      }
    })

    this.element.addEventListener('pointerleave', (e) => {
      this.clicked = false
      setTimeout(() => {
        for (const window of windows) {
          if (!window.clicked) {
            window.animateOut()
          } else {
            window.clicked = false
          }
        }
      })
    })
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