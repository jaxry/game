<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import MoveAndPickup from '../effects/MoveAndPickup'
  import { game } from './stores'
  import { startPlayerAction } from '../behavior/core'
  import { selectedObject } from './stores'

  export let obj: GameObject

  $: log = $game.objectLog.get(obj)

  function click() {
    // new MoveAndPickup($game.player, obj).activate()
    // startPlayerAction()
    $selectedObject = obj
  }
</script>

<div class='container' on:click={click}>
  <div class='name'>{obj.type.name}</div>
  {#if log}
    <div class='log'>
      {#each log as entry}
        <div>{entry}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    padding: 1rem;
    border: var(--border);
    background: var(--background);
    cursor: grab;
  }

  .log {
    overflow: hidden;
    /*max-height: 1rem;*/
  }

  .log:hover {
    /*max-height: none;*/
  }
</style>