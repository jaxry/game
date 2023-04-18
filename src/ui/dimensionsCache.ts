const dimensionMap = new WeakMap<Element, ResizeObserverSize>()

const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    dimensionMap.set(entry.target, entry.borderBoxSize[0])
  }
})

function cacheDimensions (element: HTMLElement) {
  observer.observe(element)
  const dimensions = {
    inlineSize: element.offsetWidth,
    blockSize: element.offsetHeight,
  }
  dimensionMap.set(element, dimensions)
  return dimensions
}

export function getDimensions (element: HTMLElement) {
  let dimensions = dimensionMap.get(element)!
  if (!dimensions) {
    dimensions = cacheDimensions(element)
  }
  return {
    width: dimensions.inlineSize,
    height: dimensions.blockSize,
  }
}