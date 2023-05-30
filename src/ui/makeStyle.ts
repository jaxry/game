import { createElement } from './createElement'

type Style = Partial<CSSStyleDeclaration & { vectorEffect: string }>

export function makeStyle (style: Style): string
export function makeStyle (selector: string, style: Style): void
export function makeStyle (
    styleOrSelector: string | Style, style?: Style): string | void {
  if (typeof styleOrSelector === 'string') {
    makeStyleSelector(styleOrSelector, style!)
  } else {
    return makeStyleClass(styleOrSelector)
  }
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

const sheet = makeStyleSheet()

let nextId = 1

function makeStyleSelector (selector: string, style: Style): void {
  const index = sheet.insertRule(`${selector} {}`, sheet.cssRules.length)
  const rule = sheet.cssRules[index] as CSSStyleRule
  Object.assign(rule.style, style)
}

function makeStyleClass (style?: Style): string {
  const className = `makeStyle-${nextId++}`
  if (style) {
    makeStyleSelector(`.${className}`, style)
  }
  return className
}

function makeStyleSheet () {
  const elem = createElement(document.head, 'style')
  return elem.sheet!
}