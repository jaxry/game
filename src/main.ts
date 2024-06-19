import Game, { initGame } from './game/Game.ts'
import './util/reset.css'
import { render } from './render.ts'

export let game: Game

export function setGameInstance (g: Game) {
  game = g
}

setGameInstance(new Game())
initGame()
render()