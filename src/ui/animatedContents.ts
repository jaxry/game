import { duration } from './theme'

const positions = new WeakMap<HTMLElement, { left: number, top: number }>()

export default function animatedContents (container: HTMLElement) {

  function moveElement (element: HTMLElement) {
    const bbox = positions.get(element)!

    const { offsetLeft, offsetTop } = element

    const dx = bbox.left - offsetLeft
    const dy = bbox.top - offsetTop

    bbox.left = element.offsetLeft
    bbox.top = element.offsetTop

    if (dx === 0 && dy === 0) return

    element.animate({
      translate: [`${dx}px ${dy}px`, '0 0'],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `accumulate`,
    })
  }

  const resizeObserver = new ResizeObserver(() => {
    for (const element of container.children as Iterable<HTMLElement>) {
      moveElement(element)
    }
  })

  function initElement (element: HTMLElement) {
    positions.set(element, {
      left: element.offsetLeft,
      top: element.offsetTop,
    })
    resizeObserver.observe(element)
  }

  const mutationObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      for (const element of mutation.addedNodes as Iterable<HTMLElement>) {
        initElement(element)
      }
    }
  })

  mutationObserver.observe(container, {
    childList: true,
    attributes: false,
  })

  for (const element of container.children as Iterable<HTMLElement>) {
    initElement(element)
  }
}
