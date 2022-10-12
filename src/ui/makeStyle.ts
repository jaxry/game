type Style = Partial<CSSStyleDeclaration>

function makeStyleSheet () {
  const elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')
  document.head.append(elem)
  return elem.sheet!
}

const sheet = makeStyleSheet()

let nextId = 1

function makeStyleClass (style?: Style): string {
  const className = `makeStyle-${nextId++}`
  if (style) {
    const index = sheet.insertRule(`.${className} {}`, sheet.cssRules.length)
    const rule = sheet.cssRules[index] as CSSStyleRule
    for (const key in style) {
      rule.style[key] = style[key]!
    }
  }
  return className
}

function makeStyleSelector (selector: string, style: Style): void {
  const index = sheet.insertRule(`${selector} {}`, sheet.cssRules.length)
  const rule = sheet.cssRules[index] as CSSStyleRule
  for (const key in style) {
    rule.style[key] = style[key]!
  }
}

export function makeStyle (style?: Style): string
export function makeStyle (selector: string, style: Style): void
export function makeStyle (
    selectorOrStyle?: string | Style,
    styleOrName?: Style | string): string | void {
  if (typeof selectorOrStyle === 'string') {
    makeStyleSelector(selectorOrStyle, styleOrName!)
  } else {
    return makeStyleClass(selectorOrStyle)
  }
}