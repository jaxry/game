<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import Action from './Action.svelte'

  export let object: GameObject
</script>

{#if object.type.description}
  <div class='description'>{object.type.description}</div>
{/if}

{#if object.activeAction}
  <h3 class='action'>
    <Action action={object.activeAction}/>
  </h3>
{/if}

{#if object.health}
  <div>Health: {object.health}</div>
{/if}

<style>
  .description {
    font-style: italic;
    margin-bottom: 1rem;
  }
</style>