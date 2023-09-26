import { loadGame } from './saveLoad'
import Game from './Game'
import { initGame } from './initGame.ts'
import GameUI from './ui/components/GameUI.ts'

export let game: Game

let ui: GameUI

startGame()

export function startGame () {
  ui?.remove()
  loadGame().then((loadedGame) => {
    game = loadedGame
  }).catch(() => {
    game = new Game()
    initGame(game)
  }).then(() => {
    // @ts-ignore
    window.game = game
    ui = new GameUI().appendTo(document.body)
  })
}