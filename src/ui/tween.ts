export interface Tween {
  onfinish?: () => void
}

export default function tween (
    callback: (lerpProgress: (
        start: number, end: number) => number, progress: number) => void,
    options: KeyframeAnimationOptions): Tween {

  const duration = Number(options.duration) ?? 1000

  let progress = 0

  function lerpProgress (start: number, end: number) {
    return start + (end - start) * progress
  }

  const returnObj: Tween = {}

  const start = performance.now()

  const tick = () => {
    const elapsed = performance.now() - start

    progress = easeInOutCubic(elapsed / duration)

    callback(lerpProgress, progress)

    if (elapsed < duration) {
      requestAnimationFrame(tick)
    } else {
      returnObj.onfinish?.()
    }
  }

  tick()

  return returnObj
}

function easeInOutCubic (x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}