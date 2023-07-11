import { numToPx } from '../util'
import { createDiv } from './createElement'
import { duration } from './theme'
import { addStyle, makeStyle } from './makeStyle'
import tween from './tween'

const elementToCancelAnimation = new WeakMap<Element, () => void>()

export function grow (
    element: HTMLElement, options?: KeyframeAnimationOptions) {

  const { offsetWidth, offsetHeight } = element

  const dummy = getDummy(element)

  elementToCancelAnimation.get(element)?.()

  const animation = dummy.animate({
    width: [`0`, numToPx(offsetWidth)],
    height: [`0`, numToPx(offsetHeight)],
    scale: [`0`, `1`]
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
  const min = minDimensions(element)
  elementToCancelAnimation.get(element)?.()

  element.style.overflow = 'hidden'

  const t = tween((interp) => {
    element.style.width = ''
    element.style.height = ''
    const width = element.offsetWidth
    const height = element.offsetHeight
    element.style.width = numToPx(interp(min.width, width))
    element.style.height = numToPx(interp(min.height, height))
  }, { ...defaultOptions, ...options })

  elementToCancelAnimation.set(element, () => t.cancel())

  t.onfinish = () => {
    elementToCancelAnimation.delete(element)
  }
}

export function shrink (
    element: HTMLElement, options?: KeyframeAnimationOptions) {
  elementToCancelAnimation.get(element)?.()

  const width = element.offsetWidth
  const height = element.offsetHeight

  const t = tween((interp) => {
    element.style.width = ''
    element.style.height = ''
    const min = minDimensions(element)
    element.style.width = numToPx(interp(width, 0))
    element.style.height = numToPx(interp(height, 0))
  }, { ...defaultOptions, ...options })


  elementToCancelAnimation.set(element, () => t.cancel())

  const returnObj: any = {
    onFinish: undefined
  }

  t.onfinish = () => {
    elementToCancelAnimation.delete(element)
    returnObj.onfinish()
  }

  return returnObj
}

function getDummy (element: Element) {
  if (elementToCancelAnimation.has(element)) {
    return element.parentElement!
  } else {
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
function minDimensions (element: HTMLElement) {
  const parentWidthAfter = element.parentElement!.offsetWidth
  const parentHeightAfter = element.parentElement!.offsetHeight

  element.style.display = `none`

  const parentWidthBefore = element.parentElement!.offsetWidth
  const parentHeightBefore = element.parentElement!.offsetHeight

  element.style.display = ''

  const parentWidthDiff = parentWidthAfter - parentWidthBefore
  const parentHeightDiff = parentHeightAfter - parentHeightBefore

  return {
    width: element.offsetWidth - parentWidthDiff,
    height: element.offsetHeight - parentHeightDiff,
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