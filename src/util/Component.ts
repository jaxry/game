import { pushURL } from './url.ts'
import { isArray, isFunction, isObject } from './is.ts'
import { Falsy, StringLike } from './types.ts'
import { clearElement } from './dom.ts'
import { assignStyle, Style } from './makeStyle.ts'

export type ComponentChild =
  Component
  | StringLike
  | undefined
  | ((component: Component) => ComponentChild)
  | { render (): ComponentChild }
  | ComponentChild[]

export default class Component<T extends HTMLElement = any> {
  attachedToDocument = false
  parent?: Component
  children?: Set<Component>

  private mount?: ((component: Component<T>) => (void | ((component: Component<T>) => void)))[]
  private cleanup?: ((component: Component<T>) => void)[]

  constructor (public element: T) {

  }

  get width () {
    return this.element.offsetWidth
  }

  get height () {
    return this.element.offsetHeight
  }

  add (...children: ComponentChild[]) {
    const output = this.flatten(children)

    for (const child of output) {
      if (child instanceof Component) {
        this.element.append(child.element)
        this.addComponent(child)
      } else if (output.length === 1) {
        this.element.append(child as string)
      } else {
        const container = document.createElement('div')
        container.append(child as string)
        this.element.append(container)
      }
    }

    return this
  }

  addTo (parent: Component) {
    parent.add(this)
    return this
  }

  remove () {
    this.removeComponent()
    this.element.remove()
    return this
  }

  set (...children: ComponentChild[]) {
    clearElement(this.element)
    if (this.children) {
      for (const child of this.children) {
        child.removeComponent()
      }
    }
    this.add(...children)
    return this
  }

  setTo (parent: Component) {
    parent.set(this)
    return this
  }

  replace (target: Component) {
    const parent = target.parent!
    target.element.replaceWith(this.element)
    target.removeComponent()
    parent.addComponent(this)
    return this
  }

  onMount (callback: (component: Component<T>) => void | ((component: Component<T>) => void)) {
    if (!this.mount) {
      this.mount = []
      this.cleanup = []
    }

    this.mount.push(callback)

    return this
  }

  style (...styles: (string | Falsy)[]) {
    for (const style of styles) {
      style && this.element.classList.add(style)
    }

    return this
  }

  removeStyle (...styles: string[]) {
    for (const style of styles) {
      if (style) {
        this.element.classList.remove(style)
      }
    }
    return this
  }

  toggleStyle (style: string, condition?: boolean) {
    this.element.classList.toggle(style, condition)
  }

  inline (style: Style) {
    assignStyle(style, this.element.style)
    return this
  }

  do (fn: (component: this) => any) {
    fn(this)
    return this
  }

  then<K> (fn: (component: this) => K) {
    return fn(this)
  }

  on<K extends keyof HTMLElementEventMap> (
    event: K, callback: (e: HTMLElementEventMap[K], component: this) => any) {
    this.element.addEventListener(event, (e) => callback(e, this))
    return this
  }

  rect () {
    return this.element.getBoundingClientRect()
  }

  addToDocument () {
    document.body.append(this.element)
    if (!this.attachedToDocument) {
      this.doMount()
    }
    return this
  }

  private addComponent (child: Component) {
    if (!this.children) {
      this.children = new Set()
    }
    this.children.add(child)

    if (child.parent) {
      child.removeComponent()
    }
    child.parent = this
    if (this.attachedToDocument) {
      child.doMount()
    }
  }

  private removeComponent () {
    if (this.attachedToDocument) {
      this.doCleanup()
    }
    this.parent?.children!.delete(this)
    this.parent = undefined
  }

  private doMount () {
    this.attachedToDocument = true

    if (this.mount) {
      for (const fn of this.mount) {
        const cleanup = fn(this)
        if (cleanup) {
          this.cleanup!.push(cleanup)
        }
      }
    }

    if (this.children) {
      for (const child of this.children) {
        child.doMount()
      }
    }
  }

  private doCleanup () {
    if (this.children) {
      for (const child of this.children) {
        child.doCleanup()
      }
    }

    if (this.cleanup) {
      for (const callback of this.cleanup) {
        callback(this)
      }
      this.cleanup.length = 0
    }

    this.attachedToDocument = false
  }

  private flatten (
    input: ComponentChild[], output: (StringLike | Component)[] = []) {

    for (let child of input) {
      if (isFunction(child)) {
        child = child(this)
      } else if (isObject(child) && 'render' in child) {
        child = child.render()
      }

      if (child === undefined || child === null || child === false) {
        continue
      }

      if (isArray(child)) {
        this.flatten(child, output)
      } else {
        output.push(child)
      }
    }

    return output
  }

}

export function element<K extends keyof HTMLElementTagNameMap> (tag: K) {
  return new Component(document.createElement(tag))
}

export function div (...content: ComponentChild[]) {
  return element('div').add(...content)
}

export function span (...content: ComponentChild[]) {
  return element('span').add(...content)
}

export function img (src: string) {
  return element('img').do((c) => {
    c.element.src = src
  })
}

export function anchor (path: string) {
  return element('a')
    .do((a) => {
      a.element.href = path
    }).on('click', (e) => {
      e.preventDefault()
      pushURL(path)
    })
}
