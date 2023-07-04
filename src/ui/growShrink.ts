import { numToPx } from '../util'
import { createDiv } from './createElement'
import { duration } from './theme'
import { addStyle, makeStyle } from './makeStyle'
import tween from './tween'

export function grow (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  const dummy = replaceWithDummy(element)
  const dim = calcToAndFromDimensions(dummy, element)

  const animation = dummy.animate({
    width: [numToPx(dim.startWidth), numToPx(dim.endWidth)],
    height: [numToPx(dim.startHeight), numToPx(dim.endHeight)],
    margin: [`0`, getComputedStyle(element).margin],
  }, { ...defaultOptions, ...options })

  animation.addEventListener('finish', () => {
    replaceWithOriginal(dummy, element)
  })

  return animation
}

export function growDynamic (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  const dummy = replaceWithDummy(element)
  const dim = calcToAndFromDimensions(dummy, element)

  tween((interp) => {
    dummy.style.width = numToPx(interp(dim.startWidth, element.offsetWidth))
    dummy.style.height = numToPx(interp(dim.startHeight, element.offsetHeight))
  }, { ...defaultOptions, ...options })

  const animation = dummy.animate({
    margin: [`0`, getComputedStyle(element).margin],
  }, { ...defaultOptions, ...options })

  animation.addEventListener('finish', () => {
    replaceWithOriginal(dummy, element)
  })

  return animation
}

export function shrink (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  const dummy = replaceWithDummy(element)
  const dim = calcToAndFromDimensions(dummy, element)

  const animation = dummy.animate({
    width: [numToPx(dim.endWidth), numToPx(dim.startWidth)],
    height: [numToPx(dim.endHeight), numToPx(dim.startHeight)],
    margin: `0`,
  }, { ...defaultOptions, ...options })

  animation.addEventListener('finish', () => {
    dummy.remove()
  })

  return animation
}

function replaceWithDummy (element: Element) {
  const dummy = createDiv(null, dummyStyle)
  element.replaceWith(dummy)
  dummy.append(element)
  return dummy
}

function replaceWithOriginal (dummy: Element, element: Element) {
  if (element.parentNode === dummy) {
    dummy.replaceWith(element)
  } else {
    dummy.remove()
  }
}

function calcToAndFromDimensions (dummy: HTMLElement, element: HTMLElement) {
  const parentWidthAfter = dummy.parentElement!.offsetWidth
  const parentHeightAfter = dummy.parentElement!.offsetHeight

  dummy.style.width = `0`
  dummy.style.height = `0`

  const parentWidthBefore = dummy.parentElement!.offsetWidth
  const parentHeightBefore = dummy.parentElement!.offsetHeight

  const parentWidthDiff = parentWidthAfter - parentWidthBefore
  const parentHeightDiff = parentHeightAfter - parentHeightBefore

  const width = element.offsetWidth
  const height = element.offsetHeight

  return {
    // starting width/height is the size of the child that
    // doesn't change the parent container's size
    startWidth: width - parentWidthDiff,
    startHeight: height - parentHeightDiff,
    endWidth: width,
    endHeight: height,
  }
}

const defaultOptions: KeyframeAnimationOptions = {
  duration: duration.normal,
  easing: 'ease',
  fill: 'forwards',
}

const dummyStyle = makeStyle({
  contain: `content`,
  pointerEvents: `none`,
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
})

addStyle(`.${dummyStyle} > *`, {
  flex: `0 0 auto`,
})