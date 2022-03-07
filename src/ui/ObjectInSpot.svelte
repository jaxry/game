<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import MoveAndPickup from '../effects/MoveAndPickup'
  import Action from './Action.svelte'
  import { game } from './stores'
  import { startPlayerAction } from '../behavior/core'
  import { setSelectedObject } from './stores'

  export let obj: GameObject

  $: log = $game.objectLog.get(obj)

  function click(e: PointerEvent) {
    // new MoveAndPickup($game.player, obj).activate()
    // startPlayerAction()
    setSelectedObject(obj)
    e.stopPropagation()
  }
</script>

<div class='container' on:click={click}>
  <div class='name'>{obj.type.name}</div>

  {#if obj.activeAction}
    <Action action={obj.activeAction} />
  {/if}

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