import Component, { addComponentToStage, Events } from './Component'
import { iterToSet } from '../util'

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

  baseComponent: Component

  idToComponent = new Map<number, Component>()

  private animationId: number

  constructor (parent: HTMLElement, baseComponent: Component) {
    parent.appendChild(this.canvas)

    this.baseComponent = baseComponent
    addComponentToStage(baseComponent, this)

    this.resize()
    window.addEventListener('resize', this.resize)

    this.setupEvents()

    this.draw()
  }

  setComponentHitboxId (component: Component) {
    const id = this.nextNewHitId++
    this.idToComponent.set(id, component)
    component.hitId = id
    component.hitColor = idToColor(id)
  }

  remove () {
    window.removeEventListener('resize', this.resize)
    cancelAnimationFrame(this.animationId)
    this.canvas.remove()
  }

  removeComponentId (component: Component) {
    this.idToComponent.delete(component.hitId)
  }

  private setupEvents () {
    const getIdAtPointer = (e: PointerEvent) => {
      const x = e.clientX * devicePixelRatio
      const y = e.clientY * devicePixelRatio
      const pixel = this.hitCtx.getImageData(x, y, 1, 1).data
      return colorToId(pixel[0], pixel[1], pixel[2])
    }

    const emitUntil = (id: number, name: keyof Events, stopId: number) => {
      if (!id) {
        return
      }
      const stopBranch = stopId ?
          iterToSet(ancestors(this.idToComponent.get(stopId)!)) :
          undefined

      for (const component of ancestors(this.idToComponent.get(id)!)) {
        if (stopBranch?.has(component)) {
          return
        }
        const bubble = component.events[name]?.emit({}) ?? true
        if (!bubble) {
          return
        }
      }
    }

    const emit = (id: number, name: keyof Events) => {
      if (!id) {
        return
      }
      for (const component of ancestors(this.idToComponent.get(id)!)) {
        const bubble = component.events[name]?.emit({}) ?? true
        if (!bubble) {
          return
        }
      }
    }

    let downId = 0
    this.canvas.addEventListener('pointerdown', (e) => {
      downId = getIdAtPointer(e)
      emit(downId, 'pointerdown')
    })

    this.canvas.addEventListener('pointerup', (e) => {
      const id = getIdAtPointer(e)
      emit(id, 'pointerup')
      // if (id === downId) {
      //   emitAndBubble(id, 'click')
      // }
    })

    let lastId = 0
    this.canvas.addEventListener('pointermove', (e) => {
      const id = getIdAtPointer(e)
      if (id !== lastId) {
        emitUntil(lastId, 'pointerout', id)
        emitUntil(id, 'pointerenter', lastId)
        lastId = id
      }
    })
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

function* ancestors (component: Component) {
  do {
    yield component
    component = component.parentComponent!
  } while (component)
}
