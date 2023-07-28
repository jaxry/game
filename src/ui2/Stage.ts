import Component, { CanvasPointerEvent } from './Components/Component'
import { iterToSet } from '../util'
import { runAnimations } from './Animate'
import { canvasKit } from './canvasKit.ts'
import { Canvas, Surface } from 'canvaskit-wasm'

export default class Stage {
  canvasElement = document.createElement('canvas')
  surface: Surface
  animationId = 0

  baseComponent: Component

  constructor (parent: HTMLElement, baseComponent: Component) {
    parent.appendChild(this.canvasElement)

    this.createSurface()
    window.addEventListener('resize', this.createSurface)

    this.setupEvents()

    this.baseComponent = baseComponent
    this.baseComponent.init(this)
  }

  get width () {
    return this.canvasElement.width
  }

  get height () {
    return this.canvasElement.height
  }

  private setupEvents () {

    let downComponent: Component
    this.canvasElement.addEventListener('pointerdown', (e) => {
      const event = makePointerEvent(this, e)
      downComponent = event.target
      emit(event, 'pointerdown')
    })

    this.canvasElement.addEventListener('pointerup', (e) => {
      const pointerEvent = makePointerEvent(this, e)
      emit(pointerEvent, 'pointerup')
      if (downComponent) {
        emitShared(pointerEvent, 'click', downComponent)
      }
    })

    let lastComponent: Component
    this.canvasElement.addEventListener('pointermove', (e) => {
      const event = makePointerEvent(this, e)
      if (event.target !== lastComponent) {
        emitUntil({ ...event, target: lastComponent }, 'pointerout',
            event.target)
        emitUntil(event, 'pointerenter', lastComponent)
        lastComponent = event.target
      }
    })
  }

  private queueDraw () {
    this.animationId = this.surface.requestAnimationFrame(this.draw)
  }

  private draw = (canvas: Canvas) => {
    runAnimations()
    // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.baseComponent.draw(canvas)
    this.queueDraw()
  }

  private createSurface = () => {
    const width = this.canvasElement.clientWidth * devicePixelRatio
    const height = this.canvasElement.clientHeight * devicePixelRatio
    this.canvasElement.width = width
    this.canvasElement.height = height

    this.surface?.delete()
    this.surface = canvasKit.MakeWebGLCanvasSurface(
        this.canvasElement, undefined, { alpha: 0 })!

    cancelAnimationFrame(this.animationId)
    this.queueDraw()
  }
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

  return {
    x,
    y,
    target: stage.baseComponent.hit(x, y),
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

