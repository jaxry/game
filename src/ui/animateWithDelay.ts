export default function animateWithDelay(elem: HTMLElement, from: Keyframe, to: Keyframe, options: KeyframeAnimationOptions) {
  const delay = Number(options.delay) ?? 0
  const duration = Number(options.duration) ?? 1000
  const total = delay + duration
  elem.animate([
    {
      ...from,
      easing: 'linear'
    },
    {
      ...from,
      easing: options.easing || 'linear',
      offset: delay / total
    },
    to
  ], {
    ...options,
    duration: total,
    delay: 0,
  })
}