export default function animateManual (
    element: HTMLElement, duration: number, callback: (t: number) => void) {

  const start = performance.now()

  const tick = () => {
    const time = performance.now() - start

    const progress = easeInOutCubic(time / duration)

    callback(progress)

    if (time < duration) {
      requestAnimationFrame(tick)
    }
  }

  tick()
}

function easeInOutCubic (x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}