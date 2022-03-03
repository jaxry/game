<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import MoveAndPickup from '../effects/MoveAndPickup'
  import { game } from './stores'
  import { startPlayerAction } from '../behavior/core'

  export let obj: GameObject

  function click() {
    new MoveAndPickup($game.player, obj).activate()
    startPlayerAction()
  }
</script>

<div on:click={click}>
  {obj.type.name}
</div>

<style>
  div {
    padding: 1rem;
    border: var(--border);
    background: var(--background);
    cursor: grab;
  }
</style>