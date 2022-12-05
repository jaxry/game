import { numToPx } from '../util'

export default function bBoxDiff (oldBBox: DOMRect, newBBox: DOMRect) {
  const x = oldBBox.x - newBBox.x
  const y = oldBBox.y - newBBox.y
  return `translate(${numToPx(x)}, ${numToPx(y)})`
}
