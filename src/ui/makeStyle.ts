type Style = Partial<CSSStyleDeclaration>

export function makeStyle (style?: Style): string
export function makeStyle (selector: string, style: Style): void
export function makeStyle (
    styleOrSelector?: string | Style,
    style?: Style | string): string | void {
  if (typeof styleOrSelector === 'string') {
    makeStyleSelector(styleOrSelector, style!)
  } else {
    return makeStyleClass(styleOrSelector)
  }
}

const sheet = makeStyleSheet()

let nextId = 1

function makeStyleSelector (selector: string, style: Style): void {
  const index = sheet.insertRule(`${selector} {}`, sheet.cssRules.length)
  const rule = sheet.cssRules[index] as CSSStyleRule
  for (const key in style) {
    rule.style[key] = style[key]!
  }
}

function makeStyleClass (style?: Style): string {
  const className = `makeStyle-${nextId++}`
  if (style) {
    makeStyleSelector(`.${className}`, style)
  }
  return className
}

function makeStyleSheet () {
  const elem = document.createElement('style')
  document.head.append(elem)
  return elem.sheet!
}


