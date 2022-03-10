<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import { dragAndDropGameObject, selectedObject } from './stores'
  import Action from './Action.svelte'

  export let object: GameObject

  $: selected = object === $selectedObject
</script>

<h2 class='label' class:selected use:dragAndDropGameObject.drag={object}>
  {object.type.name}
</h2>

{#if object.type.description}
  <div class='description'>{object.type.description}</div>
{/if}

{#if object.activeAction}
  <Action action={object.activeAction}/>
{/if}

{#if object.health}
  <div>Health: {object.health}</div>
{/if}

<style>
  .label {
    text-transform: capitalize;
    cursor: grab;
  }

  .selected {
    color: var(--secondary);
  }

  .description {
    font-style: italic;
  }
</style>