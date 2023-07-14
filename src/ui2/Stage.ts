import Component, { initComponent } from './Component'
import Observable from '../Observable'
import { KeysMatching } from '../types'

export default class Stage {
  canvas = document.createElement('canvas')
  ctx = this.canvas.getContext('2d', {
    alpha: false,
  })!
  hitCtx = document.createElement('canvas').getContext('2d', {
    alpha: false,
    willReadFrequently: true,
  })!
  nextNewHitId = 1
  lastHitId = 0

  baseComponent: Component

  idToComponent = new Map<number, Component>()

  private animationId: number

  constructor (parent: HTMLElement, baseComponent: Component) {
    parent.appendChild(this.canvas)

    this.baseComponent = baseComponent
    initComponent(baseComponent, this)

    this.resize()
    window.addEventListener('resize', this.resize)

    const emitAndBubble = (
        id: number, name: KeysMatching<Component, Observable>) => {
      let component = this.idToComponent.get(id)!
      let bubble = true
      do {
        bubble = component[name]?.emit()
        component = component.parentComponent!
      } while (bubble && component)
    }

    this.canvas.addEventListener('click', (e) => {
      const x = e.clientX * devicePixelRatio
      const y = e.clientY * devicePixelRatio
      const pixel = this.hitCtx.getImageData(x, y, 1, 1).data
      const id = colorToId(pixel[0], pixel[1], pixel[2])

      if (id === 0) return

      emitAndBubble(id, 'clickObserver')
    })

    this.canvas.addEventListener('pointermove', (e) => {
      const x = e.clientX * devicePixelRatio
      const y = e.clientY * devicePixelRatio
      const pixel = this.hitCtx.getImageData(x, y, 1, 1).data
      const id = colorToId(pixel[0], pixel[1], pixel[2])
      if (id !== this.lastHitId) {
        this.lastHitId && emitAndBubble(this.lastHitId, 'pointerOutObserver')
        id && emitAndBubble(id, 'pointerEnterObserver')
        this.lastHitId = id
      }
    })

    this.draw()
  }

  remove () {
    window.removeEventListener('resize', this.resize)
    cancelAnimationFrame(this.animationId)
    this.canvas.remove()
  }

  registerComponent (component: Component) {
    const id = this.nextNewHitId++
    this.idToComponent.set(id, component)
    component.hitColor = idToColor(id)
  }

  private draw = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.hitCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.baseComponent.draw()
    this.animationId = requestAnimationFrame(this.draw)
  }

  private resize = () => {
    const width = this.canvas.offsetWidth * devicePixelRatio
    const height = this.canvas.offsetHeight * devicePixelRatio
    this.canvas.width = width
    this.canvas.height = height
    this.hitCtx.canvas.width = width
    this.hitCtx.canvas.height = height
  }
}

export function idToColor (id: number) {
  const b = id % 256
  const g = Math.floor(id / 256) % 256
  const r = Math.floor(id / 256 / 256)
  return `rgb(${r},${g},${b})`
}

export function colorToId (r: number, g: number, b: number) {
  return r * 256 * 256 + g * 256 + b
}
