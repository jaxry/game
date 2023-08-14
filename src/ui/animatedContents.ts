import { duration } from './theme'

const positions = new WeakMap<HTMLElement, { x: number, y: number }>()

//TODO: deleting the outer element of a nested element errors

export default function animatedContents (
    container: HTMLElement, animDuration = duration.normal) {
  let first = true
  const animateChildren = () => {
    // ResizeObserver is called on element creation. Ignore this event.
    if (first) return first = false

    for (const element of container.children as Iterable<HTMLElement>) {
      if (!document.contains(element) || isAbsolutePositioned(element)) {
        continue
      }
      animate(element, animDuration)
    }
  }

  const resizeObserver = new ResizeObserver(animateChildren)

  function initElement (element: HTMLElement) {
    if (isAbsolutePositioned(element)) {
      return
    }
    positions.set(element, position(element))
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

function animate (element: HTMLElement, animDuration: number) {
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
    easing: `ease`,
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
