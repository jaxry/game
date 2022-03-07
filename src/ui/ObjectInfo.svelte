<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import {dragAndDropGameObject} from './stores'
  import Action from './Action.svelte'

  export let object: GameObject
</script>

<h2 class='label' use:dragAndDropGameObject.drag={object}>
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
  }
  .description {
    font-style: italic;
  }
</style>