const callbacks = new Set<() => void>()
const observer = new MutationObserver(() => {
  for (const callback of callbacks) {
    callback()
  }
})

export function onUIChange (callback: () => void) {
  if (callbacks.size === 0) {
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
    })
  }

  callbacks.add(callback)

  return () => {
    callbacks.delete(callback)

    if (callbacks.size === 0) {
      observer?.disconnect()
    }
  }
}