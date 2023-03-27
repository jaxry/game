
let observer: MutationObserver | null = null
let callbacks = new Set<() => void>()

function createObserverIfNeeded () {
  if (observer) {
    return
  }

  observer = new MutationObserver(() => {
    for (const callback of callbacks) {
      callback()
    }
  })
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
  })
}

function removeObserverIfEmpty () {
  if (callbacks.size === 0) {
    observer?.disconnect()
    observer = null
  }
}

export function onUIChange (callback: () => void) {
  createObserverIfNeeded()
  callbacks.add(callback)
  return () => {
    callbacks.delete(callback)
    removeObserverIfEmpty()
  }
}