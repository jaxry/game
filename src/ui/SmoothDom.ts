import { numToPx } from '../util'
import { createDiv } from './create'
import { duration } from './theme'
import { makeStyle } from './makeStyle'

export function grow (element: HTMLElement) {
  const dummy = replaceWithDummy(element)

  const { parentWidthDiff, parentHeightDiff } = parentDimensionDiff(dummy)

  const width = element.offsetWidth
  const height = element.offsetHeight

  dummy.animate({
    width: [numToPx(width - parentWidthDiff), numToPx(width)],
    height: [numToPx(height - parentHeightDiff), numToPx(height)],
    margin: [`0`, getComputedStyle(element).margin],
  }, options).onfinish = () => {
    if (element.parentNode === dummy) {
      dummy.replaceWith(element)
    }
  }
}

export function shrink (element: HTMLElement, onFinish: () => void) {
  const dummy = replaceWithDummy(element)

  const { parentWidthDiff, parentHeightDiff } = parentDimensionDiff(dummy)

  const width = element.offsetWidth
  const height = element.offsetHeight

  dummy.animate({
    width: [numToPx(width), numToPx(width - parentWidthDiff)],
    height: [numToPx(height), numToPx(height - parentHeightDiff)],
    margin: [getComputedStyle(element).margin, `0`],
  }, options).onfinish = () => {
    onFinish?.()
    dummy.remove()
  }
}

function replaceWithDummy (element: Element) {
  const dummy = createDiv(null, dummyStyle)
  element.replaceWith(dummy)
  dummy.append(element)
  return dummy
}

function parentDimensionDiff (element: HTMLElement) {
  const parentWidthAfter = element.parentElement!.offsetWidth
  const parentHeightAfter = element.parentElement!.offsetHeight

  element.style.width = `0`
  element.style.height = `0`

  const parentWidthBefore = element.parentElement!.offsetWidth
  const parentHeightBefore = element.parentElement!.offsetHeight

  const parentWidthDiff = parentWidthAfter - parentWidthBefore
  const parentHeightDiff = parentHeightAfter - parentHeightBefore

  return { parentWidthDiff, parentHeightDiff }
}

const options: KeyframeAnimationOptions = {
  duration: duration.normal,
  easing: 'ease-in-out',
  fill: 'forwards',
}

const dummyStyle = makeStyle({
  contain: `content`,
  pointerEvents: `none`,
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
})

makeStyle(`.${dummyStyle} > *`, {
  flex: `0 0 auto`,
})