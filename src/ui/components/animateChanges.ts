import { translate } from '../../util'
import { duration } from '../theme'
import throttle from '../throttle'

export const animatable = 'animatable'

const bboxes = new Map<Element, DOMRect>()
const stateChanges: ( () => void )[] = []

export function animateChanges (stateChange: () => void) {
  stateChanges.push(stateChange)
  queueAnimation()
}


let changingState = false
const observer = new MutationObserver((mutations) => {
  console.log(changingState, mutations)
})

observer.observe(document.body, {
  subtree: true,
  childList: true,
  attributes: true,
  characterData: true
})


const queueAnimation = throttle(() => {
  bboxes.clear()
  document.querySelectorAll(`.animatable`).forEach(element => {
    bboxes.set(element, element.getBoundingClientRect())
  })

  changingState = true
  for (const stateChange of stateChanges) {
    stateChange()
  }
  stateChanges.length = 0
  changingState = false

  for (const [child, oldBBox] of bboxes) {
    const newBBox = child.getBoundingClientRect()
    const dx = oldBBox.x - newBBox.x
    const dy = oldBBox.y - newBBox.y

    if (dx === 0 && dy === 0) continue

    child.animate({
      transform: [translate(dx, dy), 'translate(0, 0)'],
    }, {
      duration: duration.normal,
      easing: `ease`,
      composite: `accumulate`
    })
  }
})