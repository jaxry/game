import Component, { ComponentChild, div } from './Component.ts'
import style from './Frame.module.css'
import makeDraggable from './makeDraggable.ts'
import { clamp } from './util.ts'

const defaultOptions = {
  draggable: false,
  exitOnOutsideClick: false,
  exitOnPointerLeave: false,
  resizable: false,
  pointerEvents: true,
  maxSize: 100,
}

export type FrameOptions = typeof defaultOptions

export default class Frame extends Component {
  options: FrameOptions
  content: Component

  private focused = true

  constructor (userOptions?: Partial<FrameOptions>) {
    super(document.createElement('div'))

    this.options = { ...defaultOptions, ...userOptions }

    this.content = div().style(style.content)
    super.add(this.content)

    this.style(style.frame)

    if (!this.options.pointerEvents) {
      this.style(style.noPointerEvents)
    }

    this.content.inline({
      maxWidth: `${this.options.maxSize}vw`,
      maxHeight: `${this.options.maxSize}vh`,
    })

    this.setupFocusEvents()

    if (this.options.draggable) {
      this.makeDraggable()
    }

    if (this.options.resizable) {
      this.makeResizable()
    }

    this.onMount(() => {
      this.addToDocument()
      return () => {
        this.element.remove()
      }
    })
  }

  position (x: number, y: number) {
    x = clamp(0, window.innerWidth - this.width, x)
    y = clamp(0, window.innerHeight - this.height, y)
    this.inline({
      translate: `${x}px ${y}px`,
    })
    return this
  }

  toMouse (e: MouseEvent) {
    this.position(e.clientX, e.clientY)
    return this
  }

  override add (...children: ComponentChild[]) {
    this.content.add(...children)
    return this
  }

  override set (...children: ComponentChild[]) {
    this.content.set(...children)
    return this
  }

  private makeDraggable () {
    let dx = 0
    let dy = 0

    makeDraggable(this, {
      onDragStart: e => {
        const { x, y } = this.rect()
        dx = e.clientX - x
        dy = e.clientY - y
      },
      onDrag: e => {
        this.position(e.clientX - dx, e.clientY - dy)
      },
    })
  }

  private setupFocusEvents () {
    this.on('pointerenter', () => {
      this.setFocus(true)
    })

    this.on('pointerleave', () => {
      this.setFocus(false)
      // timeout lets pointerenter event to fire first
      setTimeout(() => this.exitOnPointerLeave())
    })

    if (this.options.exitOnOutsideClick) {
      this.onMount(() => {
        const click = () => {
          if (!this.focused) {
            this.remove()
          }
        }
        window.addEventListener('click', click)
        return () => {
          window.removeEventListener('click', click)
        }
      })
    }
  }

  private parentWindow () {
    let parent = this.parent
    while (parent) {
      if (parent instanceof Frame) {
        return parent
      }
      parent = parent.parent
    }
  }

  private exitOnPointerLeave () {
    if (!this.focused && this.options.exitOnPointerLeave) {
      this.remove()
    }
    this.parentWindow()?.exitOnPointerLeave()
  }

  private setFocus (focus: boolean) {
    this.focused = focus
    this.parentWindow()?.setFocus(focus)
  }

  private makeResizable () {
    const container = div().style(style.handleContainer)
    super.add(container)

    let dx = 0
    let dy = 0

    const addHandle = (
      handleStyle: string,
      start: (x: number, y: number, rect: DOMRect) => [number, number],
      drag: (
        x: number, y: number,
        rect: DOMRect) => [number, number, number, number]) => {
      makeDraggable(div().style(style.handle, handleStyle).addTo(container), {
        onDragStart: e => {
          [dx, dy] = start(e.clientX, e.clientY, this.rect())
        },
        onDrag: e => {
          const mx = clamp(0, window.innerWidth, e.clientX - dx)
          const my = clamp(0, window.innerHeight, e.clientY - dy)
          const [x, y, width, height] = drag(mx, my, this.rect())
          this.position(x, y)
          this.content.inline({
            maxWidth: `${Math.max(32, width)}px`,
            maxHeight: `${Math.max(32, height)}px`,
          })
        },
      })
    }

    addHandle(style.n,
      (x, y, rect) => [0, y - rect.top],
      (x, y, rect) => [rect.x, y, rect.width, rect.bottom - y],
    )
    addHandle(style.e,
      (x, y, rect) => [x - rect.right, 0],
      (x, y, rect) => [rect.x, rect.y, x - rect.left, rect.height],
    )
    addHandle(style.s,
      (x, y, rect) => [0, y - rect.bottom],
      (x, y, rect) => [rect.x, rect.y, rect.width, y - rect.top],
    )
    addHandle(style.w,
      (x, y, rect) => [x - rect.left, 0],
      (x, y, rect) => [x, rect.y, rect.right - x, rect.height],
    )
    addHandle(style.ne,
      (x, y, rect) => [x - rect.right, y - rect.top],
      (x, y, rect) => [rect.x, y, x - rect.x, rect.bottom - y],
    )
    addHandle(style.se,
      (x, y, rect) => [x - rect.right, y - rect.bottom],
      (x, y, rect) => [rect.x, rect.y, x - rect.left, y - rect.top],
    )
    addHandle(style.sw,
      (x, y, rect) => [x - rect.left, y - rect.bottom],
      (x, y, rect) => [x, rect.y, rect.right - x, y - rect.top],
    )
    addHandle(style.nw,
      (x, y, rect) => [x - rect.left, y - rect.top],
      (x, y, rect) => [x, y, rect.right - x, rect.bottom - y],
    )
  }
}

export function frame (
  userOptions?: Partial<FrameOptions>) {
  return new Frame(userOptions)
}