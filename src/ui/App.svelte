<script lang='ts'>
  import './global.css'
  import { game } from '../Game'
  import GameOver from './GameOver.svelte'
  import Game from './Game.svelte'

  let state = Game

  game.player.on('destroy', () => {
    state = GameOver
  })

</script>

<svelte:component this={state}/>