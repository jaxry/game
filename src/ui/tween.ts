export class Tween {
  onfinish?: () => void
}

export default function tween (
    callback: (lerpProgress: (
        start: number, end: number) => number, progress: number) => void,
    options: KeyframeAnimationOptions): Tween {

  const duration = Number(options.duration) ?? 1000
  const easingFn = easingMap[options.easing ?? 'ease']

  let progress = 0

  function lerpProgress (start: number, end: number) {
    return start + (end - start) * progress
  }

  const returnObj = new Tween()

  const start = performance.now()

  const tick = (time: number) => {
    const elapsed = time - start

    progress = easingFn(elapsed / duration)

    callback(lerpProgress, progress)

    if (elapsed < duration) {
      requestAnimationFrame(tick)
    } else {
      returnObj.onfinish?.()
    }
  }

  tick(start)

  return returnObj
}

function linear (x: number): number {
  return x
}

function easeInOutCubic (x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function easeInCubic (x: number): number {
  return x * x * x
}

function easeOutCubic (x: number): number {
  return 1 - Math.pow(1 - x, 3)
}

const easingMap: Record<string, (x: number) => number> = {
  'linear': linear,
  'ease': easeOutCubic,
  'ease-in': easeInCubic,
  'ease-out': easeOutCubic,
  'ease-in-out': easeInOutCubic,
}