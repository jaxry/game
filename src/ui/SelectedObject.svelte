<script lang='ts'>
  import type { Action } from '../behavior/Action'
  import ActionComponent from './Action.svelte'
  import { startPlayerAction } from '../behavior/core'
  import ObjectInfo from './ObjectInfo.svelte'
  import { game, selectedObject } from './stores'
  import { getObjectInteractions, getPlayerInteractions } from '../behavior/player'

  $: selected = $selectedObject ?? $game.player.container

  $: actions = getObjectInteractions($game.player, selected)

  $: selfActions = $game.player === selected ? getPlayerInteractions($game.player) : []

  function clickAction(action: Action) {
    startPlayerAction(action)
  }
</script>

<ObjectInfo object={selected}/>

{#each actions as action (action)}
  <button on:click={() => clickAction(action)}>
    <ActionComponent {action}/>
  </button>
{/each}

{#each selfActions as action (action)}
  <button on:click={() => clickAction(action)}>
    <ActionComponent {action}/>
  </button>
{/each}
