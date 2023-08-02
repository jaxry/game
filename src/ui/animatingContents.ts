import { translate } from '../util'
import { duration } from './theme'
import { onResize } from './onResize'

const positions = new WeakMap<HTMLElement, { left: number, top: number }>()

const mutationObserver = new MutationObserver((mutationList) => {
  for (const mutation of mutationList) {
    for (const node of mutation.addedNodes as Iterable<HTMLElement>) {
      positions.set(node, {
        left: node.offsetLeft,
        top: node.offsetTop,
      })
    }

  }
})

export default function animatingContents (container: HTMLElement) {
  for (const element of container.children as Iterable<HTMLElement>) {
    positions.set(element, {
      left: element.offsetLeft,
      top: element.offsetTop,
    })
  }

  mutationObserver.observe(container, {
    childList: true,
    attributes: false,
  })

  onResize(container, () => {
    for (const element of container.children as Iterable<HTMLElement>) {
      const bbox = positions.get(element)!

      const { offsetLeft, offsetTop } = element

      const dx = bbox.left - offsetLeft
      const dy = bbox.top - offsetTop

      bbox.left = element.offsetLeft
      bbox.top = element.offsetTop

      if (dx === 0 && dy === 0) continue

      element.animate({
        transform: [translate(dx, dy), 'translate(0, 0)'],
      }, {
        duration: duration.normal,
        easing: `ease`,
        composite: `accumulate`,
      })
    }
  })
}
