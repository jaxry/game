import { clamp } from './util.ts'

export function tween (
  callback: (t: number, dt: number) => void, duration: number) {

  const tick = (time: number) => {

    const elapsed = time - start

    const t = smootherstep(clamp(0, 1, elapsed / duration))

    callback(t, t - last)

    last = t

    if (elapsed < duration) {
      requestAnimationFrame(tick)
    }
  }

  const start = performance.now()
  let last = 0
  requestAnimationFrame(tick)
}

function smootherstep (x: number) {
  return ((6 * x - 15) * x + 10) * x * x * x
}