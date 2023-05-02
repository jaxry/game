export class Tween {
  onfinish?: () => void
}

export default function tween (
    callback: (lerpProgress: (start: number, end: number) => number) => void,
    options: KeyframeAnimationOptions): Tween {

  const duration = Number(options.duration) ?? 1000
  const easingFn = easingMap[options.easing ?? 'ease']
  const delay = options.delay ?? 0

  let startTime: number
  let progress: number

  function lerpProgress (start: number, end: number) {
    return start + (end - start) * progress
  }

  const returnObj = new Tween()

  const tick = (time: number) => {
    const elapsed = time - startTime

    progress = easingFn(elapsed / duration)

    callback(lerpProgress)

    if (elapsed < duration) {
      requestAnimationFrame(tick)
    } else {
      returnObj.onfinish?.()
    }
  }

  if (delay) {
    setTimeout(() => {
      startTime = performance.now()
      tick(startTime)
    }, delay)
  } else {
    startTime = performance.now()
    tick(startTime)
  }

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