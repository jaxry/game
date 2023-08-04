import { duration } from './theme'
import { onResize } from './onResize'

const positions = new WeakMap<HTMLElement, { x: number, y: number }>()

export default function animatedContents (container: HTMLElement) {
  onResize(container, () => {
    for (const element of container.children as Iterable<HTMLElement>) {
      if (getComputedStyle(element).position === `absolute`) {
        continue
      }
      animate(element)
    }
  })

  function initElement (element: HTMLElement) {
    positions.set(element, relativePosition(element))
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
}

export function animatedElement (element: HTMLElement) {
  onResize(element, () => {
    animate(element)
  })
  positions.set(element, relativePosition(element))
}

function animate (element: HTMLElement) {
  const bbox = positions.get(element)!

  const { x, y } = relativePosition(element)

  const dx = bbox.x - x
  const dy = bbox.y - y

  bbox.x = x
  bbox.y = y

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

  return {
    x: bbox.x - parentBBox.x,
    y: bbox.y - parentBBox.y,
  }
}
