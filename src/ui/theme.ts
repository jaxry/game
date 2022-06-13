import colors from './colors'

export const duration = {
  fast: 250,
  normal: 500,
  slow: 1000,
}

export const borderColor = colors.zinc['500']
export const border = `1px solid ${borderColor}`
export const borderRadius = '0.25rem'

export const boxShadow = `0 0.25rem 0.5rem #0004`
export const shadowFilter = `drop-shadow(${boxShadow})`
