import Component, { CanvasPointerEvent } from './Components/Component'
import { iterToSet } from '../util'
import { runAnimations } from './Animate'

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

    this.resize()
    window.addEventListener('resize', this.resize)

    this.setupEvents()

    this.baseComponent = baseComponent
    this.baseComponent.init(this)

    this.draw()
  }

  setComponentHitboxId (component: Component) {
    const id = this.nextNewHitId++
    this.idToComponent.set(id, component)
    component.hitId = id
    component.hitColor = idToColor(id)
  }

  removeComponentHitboxId (component: Component) {
    this.idToComponent.delete(component.hitId)
  }

  private setupEvents () {

    let downComponent: Component
    this.canvas.addEventListener('pointerdown', (e) => {
      const event = makePointerEvent(this, e)
      downComponent = event.target
      emit(event, 'pointerdown')
    })

    this.canvas.addEventListener('pointerup', (e) => {
      const pointerEvent = makePointerEvent(this, e)
      emit(pointerEvent, 'pointerup')
      if (downComponent) {
        emitShared(pointerEvent, 'click', downComponent)
      }
    })

    let lastComponent: Component
    this.canvas.addEventListener('pointermove', (e) => {
      const event = makePointerEvent(this, e)
      if (event.target !== lastComponent) {
        emitUntil({ ...event, target: lastComponent }, 'pointerout',
            event.target)
        emitUntil(event, 'pointerenter', lastComponent)
        lastComponent = event.target
      }
    })
  }

  private draw = () => {
    runAnimations()
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.hitCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.baseComponent.draw()
    this.animationId = requestAnimationFrame(this.draw)
  }

  private resize = () => {
    const width = this.canvas.clientWidth * devicePixelRatio
    const height = this.canvas.clientHeight * devicePixelRatio
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

const makePointerEvent = (
    stage: Stage, e: PointerEvent): CanvasPointerEvent => {
  const x = e.clientX * devicePixelRatio
  const y = e.clientY * devicePixelRatio
  const pixel = stage.hitCtx.getImageData(x, y, 1, 1).data
  const id = colorToId(pixel[0], pixel[1], pixel[2])

  return {
    x: e.clientX * devicePixelRatio,
    y: e.clientY * devicePixelRatio,
    target: stage.idToComponent.get(id)!,
  }
}

const emit = (event: CanvasPointerEvent, name: string) => {
  if (!event.target) {
    return
  }
  for (const component of ancestors(event.target)) {
    if (component.events[name]?.emit(event) === false) {
      return
    }
  }
}

// emit until an ancestor of stopComponent is encountered
const emitUntil = (
    event: CanvasPointerEvent, name: string, stopComponent?: Component) => {
  if (!event.target) {
    return
  }

  const stopBranch = stopComponent ?
      iterToSet(ancestors(stopComponent)) :
      undefined

  for (const component of ancestors(event.target)) {
    if (stopBranch?.has(component) ||
        component.events[name]?.emit(event) === false) {
      return
    }
  }
}

// emit only if an ancestor of sharedComponent is encountered
const emitShared = (
    event: CanvasPointerEvent, name: string, sharedComponent: Component) => {
  if (!event.target) {
    return
  }

  const shareBranch = iterToSet(ancestors(sharedComponent))

  for (const component of ancestors(event.target)) {
    if (!shareBranch.has(component)) {
      continue
    }
    if (component.events[name]?.emit(event) === false) {
      return
    }
  }
}

