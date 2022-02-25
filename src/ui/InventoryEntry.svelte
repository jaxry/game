<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import Inventory from './Inventory.svelte'
  import { dragAndDropGameObject, selectedObject, setSelectedObject } from './stores'
  import Action from './Action.svelte'

  export let item: GameObject

  let expanded = true

  function toggleExpanded() {
    expanded = !expanded
  }

  function select() {
    setSelectedObject(item)
  }

  $: selected = $selectedObject == item
</script>

<div class='entry'>
  <div class='label' on:click={select}>
    <div class='name' class:selected use:dragAndDropGameObject.drag={item}>{item.type.name}</div>
    {#if item.activeAction}
      <Action action={item.activeAction}/>
    {/if}
  </div>

  {#if item.contains}
    <div class='arrow' class:expanded on:click={toggleExpanded}>▶</div>
  {/if}

  {#if item.contains && expanded}
    <div class='containing'>
      <Inventory container={item}/>
    </div>
  {/if}
</div>

<style>
  .entry {
    position: relative;
    user-select: none;
    padding: 0.5rem 0.5rem;
  }

  .label {
    display: inline-block;
    margin-left: 1rem;
  }

  .label:hover {
    color: #fff;
  }

  .name {
    text-transform: capitalize;
    cursor: grab;
  }

  .selected {
    color: var(--secondary) !important;
    font-weight: bolder;
  }

  .arrow {
    position: absolute;
    top: 0.5rem;
    left: 0;
    cursor: pointer;
  }

  .expanded {
    transform: rotate(90deg);
  }

  .containing {
    margin-left: 1.5rem;
    min-height: 2rem;
  }
</style>

