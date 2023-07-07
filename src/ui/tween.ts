export class Tween {
  onfinish?: () => void
  cancel: () => void
}

export default function tween (
    callback: (
        interpolate: (start: number, end: number) => number,
        interpolateDiff: (start: number, end: number) => number,
    ) => void,
    options: KeyframeAnimationOptions): Tween {

  const duration = Number(options.duration) ?? 1000
  const easingFn = easingMap[options.easing ?? 'ease']
  const delay = options.delay ?? 0

  let startTime = 0
  let progress = 0
  let lastProgress = 0
  let animationId = 0
  const returnObj = new Tween()

  function interpolate (start: number, end: number, p = progress) {
    return start + (end - start) * p
  }

  function interpolateDiff (start: number, end: number) {
    return interpolate(start, end) - interpolate(start, end, lastProgress)
  }

  const tick = () => {
    const elapsed = Math.min(performance.now() - startTime, duration)

    progress = easingFn(elapsed / duration)

    callback(interpolate, interpolateDiff)

    lastProgress = progress

    if (elapsed < duration) {
      animationId = requestAnimationFrame(tick)
    } else {
      returnObj.onfinish?.()
    }
  }

  returnObj.cancel = () => {
    cancelAnimationFrame(animationId)
  }

  const start = () => {
    startTime = performance.now()
    tick()
  }

  delay ? setTimeout(start, delay) : start()

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