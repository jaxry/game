import { duration } from './theme'
import { onResize } from './onResize'

const positions = new WeakMap<HTMLElement, { x: number, y: number }>()

//TODO: deleting the outer element of a nested element errors

export default function animatedContents (container: HTMLElement) {
  let first = true
  const animateChildren = () => {
    // ResizeObserver is called on element creation. Ignore this event.
    if (first) {
      return first = false
    }

    for (const element of container.children as Iterable<HTMLElement>) {
      if (isAbsolutePositioned(element) || !document.contains(element)) {
        continue
      }
      animate(element, offsetPosition)
    }
  }

  const resizeObserver = new ResizeObserver(animateChildren)

  function initElement (element: HTMLElement) {
    if (isAbsolutePositioned(element)) {
      return
    }
    positions.set(element, offsetPosition(element))
    resizeObserver.observe(element)
  }

  new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      for (const element of mutation.addedNodes as Iterable<HTMLElement>) {
        initElement(element)
      }
    }
  }).observe(container, {
    childList: true,
    attributes: false,
  })

  for (const element of container.children as Iterable<HTMLElement>) {
    initElement(element)
  }
}

export function animatedElement (element: HTMLElement) {
  onResize(element, () => {
    if (!document.contains(element)) {
      return
    }
    animate(element, relativePosition)
  })
  positions.set(element, relativePosition(element))
}

function animate (
    element: HTMLElement,
    positionFn: (element: HTMLElement) => { x: number, y: number }) {
  const previousPosition = positions.get(element)!

  const { x, y } = positionFn(element)

  const dx = previousPosition.x - x
  const dy = previousPosition.y - y

  previousPosition.x = x
  previousPosition.y = y

  if (dx * dx + dy * dy < 0.01) return

  element.animate({
    translate: [`${dx}px ${dy}px`, '0 0'],
  }, {
    duration: duration.normal,
    easing: `ease`,
    composite: `accumulate`,
  })
}

function relativePosition (element: HTMLElement) {
  const bbox = element.getBoundingClientRect()
  const parentBBox = element.parentElement!.getBoundingClientRect()
  const scale = element.offsetWidth / bbox.width

  return {
    x: scale * (bbox.x - parentBBox.x),
    y: scale * (bbox.y - parentBBox.y),
  }
}

function offsetPosition (element: HTMLElement) {
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
  }
}

function isAbsolutePositioned (element: HTMLElement) {
  return getComputedStyle(element).position === `absolute`
}
