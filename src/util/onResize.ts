export function onResize (
    element: HTMLElement,
    callback: (width: number, height: number,
        dw: number, dh: number) => void) {

  let first = true
  let oldWidth = 0
  let oldHeight = 0

  const observer = new ResizeObserver((entries) => {
    if (first || !document.contains(element)) return first = false

    const width = entries[0].borderBoxSize[0].inlineSize
    const height = entries[0].borderBoxSize[0].blockSize
    const dw = width - oldWidth
    const dh = height - oldHeight

    callback(width, height, dw, dh)
    oldWidth = width
    oldHeight = height
  })

  queueMicrotask(() => {
    oldWidth = element.offsetWidth
    oldHeight = element.offsetHeight
    observer.observe(element)
  })

  return () => {
    observer.disconnect()
  }
}