import { duration } from './theme'

const positions = new WeakMap<HTMLElement, { x: number, y: number }>()

export default function animatedContents (
    container: HTMLElement, animDuration = duration.normal, ease = false) {
  let first = true

  const resizeObserver = new ResizeObserver(() => {
    // ResizeObserver is called on element creation. Ignore this event.
    if (first) return first = false

    for (const element of container.children as Iterable<HTMLElement>) {
      if (!document.contains(element)) {
        continue
      }
      animate(element, animDuration, ease)
    }
  })

  function initElement (element: HTMLElement) {
    positions.set(element, getPosition(element))
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

function animate (element: HTMLElement, animDuration: number, ease: boolean) {
  const previousPosition = positions.get(element)!

  const position = getPosition(element)

  const dx = previousPosition.x - position.x
  const dy = previousPosition.y - position.y

  previousPosition.x = position.x
  previousPosition.y = position.y

  if (dx === 0 && dy === 0) return

  element.animate({
    translate: [`${dx}px ${dy}px`, '0 0'],
  }, {
    duration: animDuration,
    easing: ease ? `ease-in-out` : `ease`,
    composite: `accumulate`,
  })
}

function getPosition (element: HTMLElement) {
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
  }
}
