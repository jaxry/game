<script lang='ts'>
  import type { Action } from '../behavior/Action'
  import ActionComponent from './Action.svelte'
  import { getObjectInteractions } from '../behavior/actions'
  import { startPlayerAction } from '../behavior/core'
  import ObjectInfo from './ObjectInfo.svelte'
  import { dragAndDropGameObject, game, selectedObject } from './stores'

  $: selected = $selectedObject ?? $game.player.container

  $: actions = getObjectInteractions($game.player, selected)

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
