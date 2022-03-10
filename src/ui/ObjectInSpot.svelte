<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import Action from './Action.svelte'
  import { dragAndDropGameObject, game, selectedObject, setSelectedObject } from './stores'

  export let object: GameObject

  $: log = $game.objectLog.get(object)
  $: selected = object === $selectedObject
  $: player = object === $game.player

  function click(e: PointerEvent) {
    // new MoveAndPickup($game.player, obj).activate()
    // startPlayerAction()
    setSelectedObject(object)
    e.stopPropagation()
  }
</script>

<div class='container' class:selected class:player on:click={click} use:dragAndDropGameObject.drag={object}>
  <div class='name'>{object.type.name}</div>

  {#if object.activeAction}
    <Action action={object.activeAction}/>
  {/if}

  <!--{#if log}-->
  <!--  <div class='log'>-->
  <!--    {#each log as entry}-->
  <!--      <div>{entry}</div>-->
  <!--    {/each}-->
  <!--  </div>-->
  <!--{/if}-->
</div>

<style>
  .container {
    padding: 1rem;
    border: var(--border);
    background: var(--background);
    cursor: grab;
  }

  .container:hover {
    background: var(--hover);
  }

  .container:active {
    background: var(--active);
  }

  .name {
    text-transform: capitalize;
  }

  .selected {
    color: var(--secondary);
    font-weight: bold;
  }

  .player {
    border-color: var(--player);
  }

  .log {
    overflow: hidden;
    /*max-height: 1rem;*/
  }

  .log:hover {
    /*max-height: none;*/
  }
</style>