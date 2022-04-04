export default function createSvg<T extends keyof SVGElementTagNameMap>(tag: T): SVGElementTagNameMap[T] {
  return document.createElementNS('http://www.w3.org/2000/svg', tag)
}