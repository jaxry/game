import { createElement } from './createElement'

type Style = {
  [key in keyof CSSStyleDeclaration]?: string | { toString (): string }
}
const sheet = createElement(document.head, 'style').sheet!

let nextId = 1

export function addStyle (selector: string, style: Style): void {
  const index = sheet.insertRule(`${selector} {}`, sheet.cssRules.length)
  const rule = sheet.cssRules[index] as CSSStyleRule
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
  const name = `makeKeyframes-${nextId++}`
  const index = sheet.insertRule(`@keyframes ${name} { from {} to {} }`)
  const keyframes = sheet.cssRules[index] as CSSKeyframesRule

  const fromKeyframe = keyframes.cssRules[0] as CSSKeyframeRule
  Object.assign(fromKeyframe.style, from)

  const toKeyframe = keyframes.cssRules[1] as CSSKeyframeRule
  Object.assign(toKeyframe.style, to)

  return name
}

export function childStyle (className: string, style: Style) {
  addStyle(`.${className} > *`, style)
}

export function hoverStyle (className: string, style: Style) {
  addStyle(`.${className}:hover`, style)
}