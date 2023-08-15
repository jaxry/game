import { duration } from './theme'

const positions = new WeakMap<HTMLElement, { x: number, y: number }>()

//TODO: deleting the outer element of a nested element errors

export default function animatedContents (
    container: HTMLElement, animDuration = duration.normal, smooth = false) {
  let first = true

  const resizeObserver = new ResizeObserver(() => {
    // ResizeObserver is called on element creation. Ignore this event.
    if (first) return first = false

    for (const element of container.children as Iterable<HTMLElement>) {
      if (!document.contains(element) || isAbsolutePositioned(element)) {
        continue
      }
      animate(element, animDuration, smooth)
    }
  })

  function initElement (element: HTMLElement) {
    if (isAbsolutePositioned(element)) {
      return
    }
    positions.set(element, position(element))
    resizeObserver.observe(element)
  }

  const mutationObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      for (const element of mutation.addedNodes as Iterable<HTMLElement>) {
        initElement(element)
      }
    }
  })

  // microtask runs after the element has been fully
  // initialized with all its children
  queueMicrotask(() => {
    mutationObserver.observe(container, {
      childList: true,
      attributes: false,
    })

    for (const element of container.children as Iterable<HTMLElement>) {
      initElement(element)
    }
  })
}

function animate (element: HTMLElement, animDuration: number, smooth: boolean) {
  const previousPosition = positions.get(element)!

  const { x, y } = position(element)

  const dx = previousPosition.x - x
  const dy = previousPosition.y - y

  previousPosition.x = x
  previousPosition.y = y

  if (dx * dx + dy * dy < 0.01) return

  element.animate({
    translate: [`${dx}px ${dy}px`, '0 0'],
  }, {
    duration: animDuration,
    easing: smooth ? `ease-in-out` : `ease`,
    composite: `accumulate`,
  })
}

function position (element: HTMLElement) {
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
  }
}

function isAbsolutePositioned (element: HTMLElement) {
  return getComputedStyle(element).position === `absolute`
}
