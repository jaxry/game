import App from './ui/components/App'
import { loadGame } from './saveLoad'
import Game from './Game'
import { initGame } from './initGame.ts'

export let game: Game

let app: App

startGame()

export function startGame () {
  app?.remove()
  loadGame().then((loadedGame) => {
    game = loadedGame
  }).catch(() => {
    game = new Game()
    initGame(game)
  }).then(() => {
    // @ts-ignore
    window.game = game
    app = new App().appendTo(document.body)
  })
}