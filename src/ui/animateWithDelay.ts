export default function animateWithDelay (
    elem: Element, keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options: KeyframeAnimationOptions) {

  const animation = elem.animate(keyframes, {
    ...options,
    delay: 0,
  })

  animation.pause()

  setTimeout(() => {
    animation.play()
  }, options.delay || 0)

  return animation

}