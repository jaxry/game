<script lang='ts'>
  import type { Action } from '../behavior/Action'
  import { startPlayerAction } from '../behavior/core'
  import ObjectInfo from './ObjectInfo.svelte'
  import { game } from './stores'
  import { getPlayerInteractions } from '../behavior/player'

  $: actions = getPlayerInteractions($game.player)

  function doAction(action: Action) {
    startPlayerAction(action)
  }

</script>

<h2 class='name'>{$game.player.type.name}</h2>
<ObjectInfo object={$game.player}/>
<div>
  {#each actions as action (action)}
    <button on:click={() => doAction(action)}>{action.name}</button>
  {/each}
</div>

<style>
  .name {
    color: var(--player);
  }
</style>

