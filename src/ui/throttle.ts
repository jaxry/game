export default function throttle<T extends (...args: any) => any> (fn: T): T {
  let next: number | null = null
  let latestArgs: any

  const throttledFn = (...args: any[]) => {
    latestArgs = args

    if (!next) {
      next = requestAnimationFrame(() => {
        next = null
        return fn(...latestArgs)
      })
    }
  }

  return throttledFn as T
}