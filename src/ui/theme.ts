import colors from './colors'
import { makeKeyframes } from './makeStyle'

const baseSpeed = 600
export const duration = {
  fast: baseSpeed / 2,
  normal: baseSpeed,
  slow: baseSpeed * 2,
}

const fadeInKeyframes = makeKeyframes({ opacity: `0` }, { opacity: `1` })
export const fadeInAnimation = `${fadeInKeyframes} ${duration.fast}ms both`

const backgroundHue = colors.slate

export const backgroundColor = backgroundHue[900]
export const fontColor = colors.green[100]

export const borderColor = backgroundHue[600]
export const border = `1px solid ${borderColor}`
export const borderRadius = '0.25rem'

export const boxShadow = `0.25rem 0.25rem 0.5rem #0003`
export const boxShadowLarge = `0.5rem 0.5rem 1rem #0006`

export const sidebarColor = backgroundHue[800]
export const windowColor = backgroundHue[700]

export const mapNodeColor = backgroundHue[700]
export const mapNodeDistantColor = colors.zinc[700]

export const mapEdgeColor = backgroundHue[500]

export const objectCardColor = colors.sky[700]
export const objectCardPlayerColor = colors.green[700]
export const objectCardNameBorderColor = `#fff4`
export const objectDialogueBackground = `${colors.emerald[500]}88`

export const actionColor = colors.yellow[400]
export const actionTimeColor = colors.red[400]

