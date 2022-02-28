<script lang='ts'>
  import type { Action } from '../behavior/Action'
  import { getObjectInteractions } from '../behavior/actions'
  import { startPlayerAction } from '../behavior/core'
  import ObjectInfo from './ObjectInfo.svelte'
  import { dragAndDropGameObject, game, selectedObject } from './stores'

  $: actions = $selectedObject ? getObjectInteractions($game.player, $selectedObject) : []

  function clickAction(action: Action) {
    startPlayerAction(action)
  }
</script>

{#if $selectedObject}
  <h2 class='label' use:dragAndDropGameObject.drag={$selectedObject}>
    {$selectedObject.type.name}
  </h2>

  <ObjectInfo object={$selectedObject}/>

  {#each actions as action (action)}
    <button on:click={() => clickAction(action)}>{action.name} ({action.time}s)</button>
  {/each}
{/if}

<style>
  .label {
    text-transform: capitalize;
    color: var(--secondary);
  }
</style>