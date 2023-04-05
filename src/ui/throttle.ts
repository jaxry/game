export default function throttle<T extends (...args: any) => any> (fn: T): T {
  let queued = 0
  let latestArgs: any

  const throttledFn = (...args: any[]) => {
    latestArgs = args

    if (!queued) {
      queued = requestAnimationFrame(() => {
        queued = 0
        return fn(...latestArgs)
      })
    }
  }

  return throttledFn as T
}