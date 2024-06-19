import { addStyle } from '../util/makeStyle.ts'
import LCH from '../util/LCH.ts'

export const primary = Math.random()
export const background = new LCH(30, 0, primary)

export const textColor = new LCH(90, 0, primary)
export const textColorDark = new LCH(75, 0, primary)

export const lightBackground = background.addL(5)
export const frameBackground = new LCH(45, 0, primary)

export const borderRadius = `4px`
export const border = `2px solid ${new LCH(50, 0, primary)}`

export function applyTheme () {
  addStyle(`:root`, {
    colorScheme: `dark`,
    background: background,
    color: textColor,
    userSelect: `none`,
  })
}


