import colors from './colors'

const baseSpeed = 600
export const duration = {
  fast: baseSpeed / 2,
  normal: baseSpeed,
  slow: baseSpeed * 2,
}

export const backgroundColor = colors.zinc

export const borderColor = backgroundColor['500']
export const border = `1px solid ${borderColor}`
export const borderRadius = '0.25rem'

export const boxShadow = `0 0.25rem 0.5rem #0004`
