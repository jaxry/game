export default function throttle<T extends (...args: any) => any> (fn: T): T {
  let queued: number | null = null
  let latestArgs: any = null

  const throttledFn = (...args: any[]) => {
    // next function call already queued up
    if (queued) {
      latestArgs = args
      return
    }

    fn(...args)

    queued = requestAnimationFrame(() => {
      queued = null
      if (latestArgs !== null) {
        fn(...latestArgs)
        latestArgs = null
      }
    })
  }

  return throttledFn as T
}