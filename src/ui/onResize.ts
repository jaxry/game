export function onResize (
    element: Element,
    callback: (width: number, height: number) => void) {

  const observer = new ResizeObserver((entries) => {
    const { inlineSize, blockSize } = entries[0].borderBoxSize[0]
    callback(inlineSize, blockSize)
  })

  observer.observe(element)

  return () => {
    observer.disconnect()
  }
}