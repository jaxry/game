<script lang='ts'>
  import './global.css'
  import { game } from '../Game'
  import GameOver from './GameOver.svelte'
  import Game from './Game.svelte'
  import { rerenderGame } from './stores'

  let state = Game

  game.player.on('destroy', () => {
    state = GameOver
  })

  game.event.playerTick.on(() => {
    rerenderGame()
  })
</script>

<svelte:component this={state}/>