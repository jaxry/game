export function onResize (
    element: HTMLElement,
    callback: (width: number, height: number,
        dw: number, dh: number) => void) {

  let first = true
  let oldWidth = element.offsetWidth
  let oldHeight = element.offsetHeight

  const observer = new ResizeObserver((entries) => {
    if (first) return first = false
    const width = entries[0].borderBoxSize[0].inlineSize
    const height = entries[0].borderBoxSize[0].blockSize

    callback(width, height, width - oldWidth, height - oldHeight)
    oldWidth = width
    oldHeight = height
  })

  observer.observe(element)

  return () => {
    observer.disconnect()
  }
}