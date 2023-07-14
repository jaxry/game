import { iterChildren, mapFilter, translate } from '../../util'
import { duration } from '../theme'
import throttle from '../throttle'

export const animatable = 'animatable'

const stateChanges: (() => void)[] = []
const elements = new Set<HTMLElement>()

export function animateChanges (element: HTMLElement, stateChange: () => void) {
  stateChanges.push(stateChange)
  elements.add(element)
  queueAnimation()
}

const queueAnimation = throttle(() => {
  const affectedElements = getAffectedElements()
  const bboxes = mapFilter(affectedElements, (element) => {
    return { x: element.offsetLeft, y: element.offsetTop }
  })

  for (const stateChange of stateChanges) {
    stateChange()
  }

  let i = 0
  for (const element of affectedElements) {
    const bbox = bboxes[i++]
    const dx = bbox.x - element.offsetLeft
    const dy = bbox.y - element.offsetTop

    if (dx === 0 && dy === 0) continue

    element.animate({
      transform: [translate(dx, dy), 'translate(0, 0)'],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `accumulate`,
    })
  }

  elements.clear()
})

function relativePosition (element: HTMLElement) {
  const elementBBox = element.getBoundingClientRect()
  const parentBBox = element.offsetParent?.getBoundingClientRect()
  if (parentBBox) {
    elementBBox.x -= parentBBox.x
    elementBBox.y -= parentBBox.y
  }

  return elementBBox
}

function getAffectedElements () {
  const affectedElements = new Set<HTMLElement>()

  for (let element of elements) {
    do {
      for (const child of iterChildren(element)) {
        if (child.classList.contains(animatable)) {
          affectedElements.add(child)
        }
      }
      element = element.parentElement!
    } while (element)
  }

  return affectedElements
}