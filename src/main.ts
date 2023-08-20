import App from './ui/components/App'
import { loadGame } from './saveLoad'

let app: App

export function restartGame () {
  loadGame().then(() => {
    app?.remove()
    app = new App().appendTo(document.body)
  })
}

restartGame()
