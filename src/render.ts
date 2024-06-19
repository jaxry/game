import { div } from './util/Component.ts'
import { makeStyle } from './util/makeStyle.ts'
import { game } from './main.ts'
import { applyTheme } from './ui/theme.ts'

applyTheme()

const appStyle = makeStyle({
  height: `100vh`,
  overflow: `hidden`,
})

const app = div().style(appStyle).addToDocument()

let renderQueued = false
export function render () {
  if (renderQueued) {
    return
  }

  setTimeout(() => {
    app.set(game.view)
    renderQueued = false
  })

  renderQueued = true
}