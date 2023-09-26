import { createElement } from './createElement.ts'

type Style = {
  [key in keyof CSSStyleDeclaration]?: string | { toString (): string }
}
const sheet = createElement(document.head, 'style').sheet!

let nextId = 1

export function addStyle (
    selector: string, style: Style, query?: string): void {
  const group = query ? makeQuery(query) : sheet as any as CSSGroupingRule

  // Adding content property dynamically doesn't work for some reason
  const contentStr = style.content ? `content: '${style.content}';` : ``

  const index = group.insertRule(`${selector} {${contentStr}}`,
      group.cssRules.length)
  const rule = group.cssRules[index] as CSSStyleRule
  Object.assign(rule.style, style)
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
  Object.assign(fromKeyframe.style, from)

  const toKeyframe = keyframes.cssRules[1] as CSSKeyframeRule
  Object.assign(toKeyframe.style, to)

  return name
}

function makeQuery (query: string) {
  const index = sheet.insertRule(`${query} {}`, sheet.cssRules.length)
  return sheet.cssRules[index] as CSSMediaRule
}