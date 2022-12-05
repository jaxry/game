import { numToPx } from '../util'

export default function bBoxDiff (oldBBox: DOMRect, newBBox: DOMRect) {
  return `translate(${numToPx(oldBBox.x - newBBox.x)}, ${numToPx(oldBBox.y - newBBox.y)})`
}
