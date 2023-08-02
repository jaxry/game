import { iterChildren, translate } from '../util'
import { duration } from './theme'

export default function animateContents(container: HTMLElement, stateChange: () => void) {
  const position = new WeakMap<HTMLElement, { left: number, top: number }>()

  for (const element of iterChildren(container)) {
    position.set(element, {
      left: element.offsetLeft,
      top: element.offsetTop,
    })
  }

  stateChange()

  for (const element of iterChildren(container)) {
    const bbox = position.get(element)
    if (!bbox) {
      continue
    }
    const dx = bbox.left - element.offsetLeft
    const dy = bbox.top - element.offsetTop

    if (dx === 0 && dy === 0) continue

    element.animate({
      transform: [translate(dx, dy), 'translate(0, 0)'],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `accumulate`,
    })
  }
}
