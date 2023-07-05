import { getAndDelete, numToPx } from '../util'
import { createDiv } from './createElement'
import { duration } from './theme'
import { addStyle, makeStyle } from './makeStyle'
import tween from './tween'

const elementToCancelAnimation = new WeakMap<Element, () => void>()

export function grow (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  if (elementToCancelAnimation.has(element)) {
    // debugger
  }
  const dummy = getDummy(element)
  const dim = calcToAndFromDimensions(dummy)
  console.log(dim)
  elementToCancelAnimation.get(element)?.()

  console.log('grow')

  const animation = dummy.animate({
    width: [numToPx(dim.startWidth), numToPx(dim.endWidth)],
    height: [numToPx(dim.startHeight), numToPx(dim.endHeight)],
    margin: [`0`, getComputedStyle(element).margin],
  }, { ...defaultOptions, ...options })

  elementToCancelAnimation.set(element, () => {
    animation.cancel()
  })

  animation.addEventListener('finish', () => {
    replaceWithOriginal(dummy, element)
    elementToCancelAnimation.delete(element)
  })

  return animation
}

export function growDynamic (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  const dummy = getDummy(element)
  const dim = calcToAndFromDimensions(dummy)
  elementToCancelAnimation.get(element)?.()

  const animation = dummy.animate({
    margin: [`0`, getComputedStyle(element).margin],
  }, { ...defaultOptions, ...options })

  const t = tween((interp) => {
    dummy.style.width = numToPx(interp(dim.startWidth, element.offsetWidth))
    dummy.style.height = numToPx(interp(dim.startHeight, element.offsetHeight))
  }, { ...defaultOptions, ...options })

  elementToCancelAnimation.set(element, () => {
    t.cancel()
    animation.cancel()
  })

  t.onfinish = () => {
    replaceWithOriginal(dummy, element)
    elementToCancelAnimation.delete(element)
  }
}

export function shrink (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  debugger
  
  const dummy = getDummy(element)
  const dim = calcToAndFromDimensions(dummy)
  elementToCancelAnimation.get(element)?.()

  console.log('shrink')

  const animation = dummy.animate({
    width: [numToPx(dim.endWidth), numToPx(dim.startWidth)],
    height: [numToPx(dim.endHeight), numToPx(dim.startHeight)],
    margin: `0`,
  }, { ...defaultOptions, ...options })

  elementToCancelAnimation.set(element, () => {
    animation.cancel()
  })

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

function calcToAndFromDimensions (dummy: HTMLElement) {
  const width = dummy.offsetWidth
  const height = dummy.offsetHeight

  const parentWidthAfter = dummy.parentElement!.offsetWidth
  const parentHeightAfter = dummy.parentElement!.offsetHeight

  dummy.style.display = `none`

  const parentWidthBefore = dummy.parentElement!.offsetWidth
  const parentHeightBefore = dummy.parentElement!.offsetHeight

  dummy.style.display = ''

  const parentWidthDiff = parentWidthAfter - parentWidthBefore
  const parentHeightDiff = parentHeightAfter - parentHeightBefore

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
})

addStyle(`.${dummyStyle} > *`, {
  flex: `0 0 auto`,
})