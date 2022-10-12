import Component from './Component'
import { makeStyle } from '../makeStyle'
import createSVG from '../createSVG'
import { gameObjects, walls, Wall, worldTick } from '../../simulation'
import panZoom from '../panZoom'
import GameObject from '../../GameObject'

export default class World extends Component {
  svg = createSVG('svg')
  camera = createSVG('g')

  gameObjectToElem = new Map<GameObject, SVGCircleElement>()
  gridCellToElem = new Map<Wall, SVGRectElement>()

  constructor () {
    super()
    this.element.classList.add(containerStyle)

    this.svg.setAttribute('width', `100%`)
    this.svg.setAttribute('height', `100%`)
    this.element.append(this.svg)

    this.svg.append(this.camera)
    const transform = new DOMMatrix()

    setTimeout(() => {
      const bbox = this.svg.getBoundingClientRect()
      const dim = Math.min(bbox.width, bbox.height)
      const scale = dim / 5
      transform.scaleSelf(scale)
      this.camera.setAttribute('transform', transform.toString())
    })

    panZoom(this.svg, transform, () => {
      this.camera.setAttribute('transform', transform.toString())
    })

    for (const wall of walls) {
      if (!wall) {
        continue
      }
      const square = createSVG('rect')
      square.setAttribute('width', `1`)
      square.setAttribute('height', `1`)
      square.setAttribute('fill', `#afa`)
      square.setAttribute('x', (wall.x - 0.5).toString())
      square.setAttribute('y', (wall.y - 0.5).toString())
      this.camera.append(square)
      this.gridCellToElem.set(wall, square)
    }

    for (const object of gameObjects) {
      const circle = createSVG('circle')
      circle.setAttribute('r', `0.4`)
      circle.setAttribute('fill', `#fff8`)
      this.camera.append(circle)
      this.gameObjectToElem.set(object, circle)
    }

    this.update()
    worldTick.on(() => this.update())
  }

  update() {
    for (const [object, circle] of this.gameObjectToElem) {
      circle.setAttribute('cx', object.position.x.toString())
      circle.setAttribute('cy', object.position.y.toString())
    }
  }
}

const containerStyle = makeStyle({
  height: `100vh`,
  margin: `1rem`
})