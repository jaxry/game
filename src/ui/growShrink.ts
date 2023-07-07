import { getAndDelete, numToPx } from '../util'
import { createDiv } from './createElement'
import { duration } from './theme'
import { addStyle, makeStyle } from './makeStyle'
import tween from './tween'

const elementToCancelAnimation = new WeakMap<Element, () => void>()

// split function into none height, current height, max height

export function grow (
    element: HTMLElement, options?: KeyframeAnimationOptions) {

  const dummy = getDummy(element)

  const min = elementToCancelAnimation.has(element) ? {
    width: dummy.offsetWidth,
    height: dummy.offsetHeight,
  } : minDimensions(dummy)

  elementToCancelAnimation.get(element)?.()

  const animation = dummy.animate({
    width: [numToPx(min.width), numToPx(element.offsetWidth)],
    height: [numToPx(min.height), numToPx(element.offsetHeight)],
  }, { ...defaultOptions, ...options })

  elementToCancelAnimation.set(element, () => animation.cancel())

  animation.addEventListener('finish', () => {
    replaceWithOriginal(dummy, element)
    elementToCancelAnimation.delete(element)
  })

  return animation
}

export function growDynamic (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  const dummy = getDummy(element)
  const min = minDimensions(dummy)
  elementToCancelAnimation.get(element)?.()

  const t = tween((interp) => {
    dummy.style.width = numToPx(interp(min.width, element.offsetWidth))
    dummy.style.height = numToPx(interp(min.height, element.offsetHeight))
  }, { ...defaultOptions, ...options })

  elementToCancelAnimation.set(element, () => t.cancel())

  t.onfinish = () => {
    replaceWithOriginal(dummy, element)
    elementToCancelAnimation.delete(element)
  }
}

export function shrink (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  const dummy = getDummy(element)
  const current = {
    width: dummy.offsetWidth,
    height: dummy.offsetHeight,
  }
  const min = minDimensions(dummy)
  elementToCancelAnimation.get(element)?.()

  const animation = dummy.animate({
    width: [numToPx(current.width), numToPx(min.width)],
    height: [numToPx(current.height), numToPx(min.height)],
  }, { ...defaultOptions, ...options })

  elementToCancelAnimation.set(element, () => animation.cancel())

  animation.addEventListener('finish', () => {
    elementToCancelAnimation.delete(element)
    dummy.remove()
  })

  return animation
}

function getDummy (element: Element) {
  if (elementToCancelAnimation.has(element)) {
    return element.parentElement!
  }
  else {
    return replaceWithDummy(element)
  }
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

// width/height is the size of the child that
// doesn't change the parent container's size
function minDimensions (dummy: HTMLElement) {
  const parentWidthAfter = dummy.parentElement!.offsetWidth
  const parentHeightAfter = dummy.parentElement!.offsetHeight

  dummy.style.display = `none`

  const parentWidthBefore = dummy.parentElement!.offsetWidth
  const parentHeightBefore = dummy.parentElement!.offsetHeight

  dummy.style.display = ''

  const parentWidthDiff = parentWidthAfter - parentWidthBefore
  const parentHeightDiff = parentHeightAfter - parentHeightBefore

  return {
    width: dummy.offsetWidth - parentWidthDiff,
    height: dummy.offsetHeight - parentHeightDiff,
  }
}

const defaultOptions: KeyframeAnimationOptions = {
  duration: duration.long,
  easing: 'ease',
  fill: 'forwards',
}

const dummyStyle = makeStyle({
  contain: `content`,
  pointerEvents: `none`,
  display: `flex`,
  justifyContent: `center`,
  alignItems: `center`,
  margin: `0`
})

addStyle(`.${dummyStyle} > *`, {
  flex: `0 0 auto`,
})