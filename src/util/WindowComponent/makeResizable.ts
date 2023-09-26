import { clamp } from '../util.ts'
import makeDraggable from '../makeDraggable.ts'
import { createDiv } from '../createElement.ts'
import { makeStyle } from '../makeStyle.ts'
import { setWindowElementPosition } from '../makeWindow.ts'

export function makeResizable (container: HTMLElement, element: HTMLElement) {
  let dx = 0
  let dy = 0

  const getRectAndMouse = (e: MouseEvent) => ({
    rect: container.getBoundingClientRect(),
    mx: clamp(0, window.innerWidth, e.clientX - dx),
    my: clamp(0, window.innerHeight, e.clientY - dy),
  })

  makeDraggable(createDiv(container, edgeStyles.n), {
    onDragStart: (e) => {
      const { top } = container.getBoundingClientRect()
      dy = e.clientY - top
    },
    onDrag: (e) => {
      const { rect, mx, my } = getRectAndMouse(e)
      element.style.maxHeight = `${rect.bottom - my}px`
      setWindowElementPosition(container, rect.x, my)
    },
  })

  makeDraggable(createDiv(container, edgeStyles.e), {
    onDragStart: (e) => {
      const { right } = container.getBoundingClientRect()
      dx = e.clientX - right
    },
    onDrag: (e) => {
      const { rect, mx, my } = getRectAndMouse(e)
      element.style.maxWidth = `${mx - rect.left}px`
    },
  })

  makeDraggable(createDiv(container, edgeStyles.s), {
    onDragStart: (e) => {
      const { bottom } = container.getBoundingClientRect()
      dy = e.clientY - bottom
    },
    onDrag: (e) => {
      const { rect, mx, my } = getRectAndMouse(e)
      element.style.maxHeight = `${my - rect.top}px`
    },
  })

  makeDraggable(createDiv(container, edgeStyles.w), {
    onDragStart: (e) => {
      const { left } = container.getBoundingClientRect()
      dx = e.clientX - left
    },
    onDrag: (e) => {
      const { rect, mx, my } = getRectAndMouse(e)
      element.style.maxWidth = `${rect.right - mx}px`
      setWindowElementPosition(container, mx, rect.y)
    },
  })

  makeDraggable(createDiv(container, edgeStyles.ne), {
    onDragStart: (e) => {
      const { right, top } = container.getBoundingClientRect()
      dx = e.clientX - right
      dy = e.clientY - top
    },
    onDrag: (e) => {
      const { rect, mx, my } = getRectAndMouse(e)
      element.style.maxWidth = `${mx - rect.x}px`
      element.style.maxHeight = `${rect.bottom - my}px`
      setWindowElementPosition(container, rect.x, my)
    },
  })

  makeDraggable(createDiv(container, edgeStyles.se), {
    onDragStart: (e) => {
      const { right, bottom } = container.getBoundingClientRect()
      dx = e.clientX - right
      dy = e.clientY - bottom
    },
    onDrag: (e) => {
      const { rect, mx, my } = getRectAndMouse(e)
      element.style.maxWidth = `${mx - rect.left}px`
      element.style.maxHeight = `${my - rect.top}px`
    },
  })

  makeDraggable(createDiv(container, edgeStyles.sw), {
    onDragStart: (e) => {
      const { left, bottom } = container.getBoundingClientRect()
      dx = e.clientX - left
      dy = e.clientY - bottom
    },
    onDrag: (e) => {
      const { rect, mx, my } = getRectAndMouse(e)
      element.style.maxWidth = `${rect.right - mx}px`
      element.style.maxHeight = `${my - rect.top}px`
      setWindowElementPosition(container, mx, rect.y)
    },
  })

  makeDraggable(createDiv(container, edgeStyles.nw), {
    onDragStart: (e) => {
      const { left, top } = container.getBoundingClientRect()
      dx = e.clientX - left
      dy = e.clientY - top
    },
    onDrag: (e) => {
      const { rect, mx, my } = getRectAndMouse(e)
      element.style.maxWidth = `${rect.right - mx}px`
      element.style.maxHeight = `${rect.bottom - my}px`
      setWindowElementPosition(container, mx, my)
    },
  })
}

const edgeSize = `1rem`
const edgeOffset = `-0.75rem`
const cornerTemplate = {
  position: `fixed`,
  width: edgeSize,
  height: edgeSize,
}
const edgeStyles = {
  n: makeStyle({
    position: `fixed`,
    width: `100%`,
    height: edgeSize,
    top: edgeOffset,
    left: `0`,
    cursor: `n-resize`,
  }),
  e: makeStyle({
    position: `fixed`,
    width: edgeSize,
    height: `100%`,
    right: edgeOffset,
    top: `0`,
    cursor: `e-resize`,
  }),
  s: makeStyle({
    position: `fixed`,
    width: `100%`,
    height: edgeSize,
    bottom: edgeOffset,
    left: `0`,
    cursor: `s-resize`,
  }),
  w: makeStyle({
    position: `fixed`,
    width: edgeSize,
    height: `100%`,
    left: edgeOffset,
    top: `0`,
    cursor: `w-resize`,
  }),
  ne: makeStyle({
    ...cornerTemplate,
    top: edgeOffset,
    right: edgeOffset,
    cursor: `ne-resize`,
  }),
  se: makeStyle({
    ...cornerTemplate,
    bottom: edgeOffset,
    right: edgeOffset,
    cursor: `se-resize`,
  }),
  sw: makeStyle({
    ...cornerTemplate,
    bottom: edgeOffset,
    left: edgeOffset,
    cursor: `sw-resize`,
  }),
  nw: makeStyle({
    ...cornerTemplate,
    top: edgeOffset,
    left: edgeOffset,
    cursor: `nw-resize`,
  }),
}