import { isNumber } from './is.ts'

export type Style = {
  [key in keyof CSSStyleDeclaration]?: string | { toString (): string }

}

// const sheet = makeElement('style', document.head, []).sheet!

const sheetElement = document.createElement('style')
document.head.append(sheetElement)
const sheet = sheetElement.sheet!

let nextId = 1

export function assignStyle (from: Style, to: CSSStyleDeclaration) {
  for (const s in from) {
    (to[s] as any) = isNumber(from[s]) ? `${from[s]}rem` : from[s]
  }
}

export function addStyle (
  selector: string, style: Style, query?: string): void {
  const group = query ? makeQuery(query) : sheet as any as CSSGroupingRule

  // Adding content property dynamically doesn't work for some reason
  const contentStr = style.content ? `content: '${style.content}';` : ``

  const index = group.insertRule(`${selector} {${contentStr}}`,
    group.cssRules.length)
  const rule = group.cssRules[index] as CSSStyleRule
  assignStyle(style, rule.style)
}

export function makeStyle (style?: Style): string {
  const className = `style-${nextId++}`
  if (style) {
    addStyle(`.${className}`, style)
  }
  return className
}

export function makeKeyframes (from: Style, to: Style): string {
  const name = `keyframe-${nextId++}`
  const index = sheet.insertRule(`@keyframes ${name} { from {} to {} }`)
  const keyframes = sheet.cssRules[index] as CSSKeyframesRule

  const fromKeyframe = keyframes.cssRules[0] as CSSKeyframeRule
  assignStyle(from, fromKeyframe.style)

  const toKeyframe = keyframes.cssRules[1] as CSSKeyframeRule
  assignStyle(to, toKeyframe.style)

  return name
}

function makeQuery (query: string) {
  const index = sheet.insertRule(`${query} {}`, sheet.cssRules.length)
  return sheet.cssRules[index] as CSSMediaRule
}