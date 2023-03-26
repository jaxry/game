export function onResize(element: Element,
    callback: (entry: ResizeObserverEntry) => void) {

  const observer = new ResizeObserver((entries) => {
    callback(entries[0])
  })

  observer.observe(element)

  return () => {
    observer.disconnect()
  }
}