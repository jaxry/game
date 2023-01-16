import colors from './colors'

const baseSpeed = 600
export const duration = {
  fast: baseSpeed / 2,
  normal: baseSpeed,
  slow: baseSpeed * 2,
}

export const backgroundColor = colors.slate
export const fontColor = colors.green[100]

export const borderColor = backgroundColor[500]
export const border = `1px solid ${borderColor}`
export const borderRadius = '0.25rem'

export const boxShadow = `0 0.3rem 0.6rem #0004`

export const mapNodeColor = colors.sky[900]
export const sidebarColor = backgroundColor[800]
export const windowColor = backgroundColor[700]

export const objectCardColor = colors.teal[800]
export const objectCardNameBorderColor = colors.teal[600]
export const objectCardPlayerColor = colors.green[700]

export const actionColor = colors.yellow[400]
export const actionTargetColor = colors.pink[400]
export const actionTimeColor = colors.red[400]

