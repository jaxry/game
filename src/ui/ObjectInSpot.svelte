<script lang="ts">
  import type { GameObject } from '../GameObject'

  export let obj: GameObject
</script>

<div>{obj.type.name}</div>

<style>
  div {
    padding: 1rem;
    margin: 0.5rem;
    border: var(--border);
    background: var(--background);
  }
</style>