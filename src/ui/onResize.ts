export function onResize (
    element: Element,
    callback: (width: number, height: number) => void) {

  let first = true
  const observer = new ResizeObserver((entries) => {
    if (first) return first = false
    const { inlineSize, blockSize } = entries[0].borderBoxSize[0]
    callback(inlineSize, blockSize)
  })

  observer.observe(element)

  return () => {
    observer.disconnect()
  }
}