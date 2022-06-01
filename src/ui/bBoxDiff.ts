export default function bBoxDiff(oldBBox: DOMRect, newBBox: DOMRect) {
  return `translate(${oldBBox.x - newBBox.x}px, ${oldBBox.y - newBBox.y}px)`
}
