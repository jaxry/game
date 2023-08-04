export default function throttle<T extends () => void> (fn: T): T {
  let queued = 0

  const callFn = () => {
    queued = 0
    fn()
  }

  const throttledFn = () => {
    if (queued) {
      return
    }
    queued = requestAnimationFrame(callFn)
  }

  return throttledFn as T
}