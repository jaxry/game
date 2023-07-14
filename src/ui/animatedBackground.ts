import { onResize } from './onResize'
import { numToPx } from '../util'
import { duration } from './theme'
import { createDiv } from './createElement'

export const animatedBackgroundTemplate = {
  position: `absolute`,
  inset: `0`,
  zIndex: `-1`
}

export default function animatedBackground (parent: HTMLElement, style: string) {
  const background = createDiv(parent, style)
  onResize(parent, (box) => {
    background.animate({
      width: [
        numToPx(background.offsetWidth),
        numToPx(box.borderBoxSize[0].inlineSize)],
      height: [
        numToPx(background.offsetHeight),
        numToPx(box.borderBoxSize[0].blockSize)],
    }, {
      fill: `forwards`,
      duration: duration.normal,
      easing: `ease`,
    })
  })

  return background
}