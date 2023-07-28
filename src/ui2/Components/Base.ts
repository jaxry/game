import Component from './Component'
import ColoredBox from './ColoredBox.ts'
import { Animate } from '../Animate.ts'
import Box from './Box.ts'
import { em } from '../units.ts'
import makeDraggable, { onClickNotDrag } from '../makeDraggable.ts'

export default class Base extends Component {
  override onInit () {

    // for (let i = 0; i < 5; i++) {
    //   this.makeBox()
    // }

    setInterval(() => {
      this.makeBox()
    }, 50)

    // const layout = this.newComponent(Layout)
    // layout.x = em(3)
    // layout.y = em(3)
    // layout.addToLayout(ColoredBoxOld)
    // layout.addToLayout(ColoredBoxOld)
    // layout.addToLayout(ColoredBoxOld)
  }

  makeBox () {
    const box = this.newComponent(ColoredBox)
    box.x =
        Math.floor((this.stage.width - box.width) * Math.random())
    box.y = Math.floor(
        (this.stage.height - box.height) * Math.random())

    makeDraggable(box, {
      onDrag: (e) => {
        box.x += e.movementX * devicePixelRatio
        box.y += e.movementY * devicePixelRatio
      },
    })

    onClickNotDrag(box, (e) => {
      console.log('click', box.id)
    })

    const wobble = new Wobble(box)
    box.onRemove(() => {
      wobble.end()
    })

    setTimeout(() => {
      box.remove()
    }, 10000)
  }
}

class Wobble extends Animate {
  offsetX = 0
  offsetY = 0
  waveOffset = Math.PI * 2 * Math.random()

  constructor (public box: Box) {
    super()
  }

  override tick () {
    const oldOffsetX = this.offsetX
    const oldOffsetY = this.offsetY
    this.offsetX = Math.sin(this.waveOffset + this.elapsed * 0.002) * em(1)
    this.offsetY = Math.cos(this.waveOffset + this.elapsed * 0.002) * em(1)
    this.box.x += this.offsetX - oldOffsetX
    this.box.y += this.offsetY - oldOffsetY
  }
}