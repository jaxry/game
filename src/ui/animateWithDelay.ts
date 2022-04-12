export default function animateWithDelay(
    elem: HTMLElement, keyframes: Keyframe[],
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