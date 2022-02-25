<script>
  import { tick } from '../behavior/core'
  import Inventory from './Inventory.svelte'
  import { rerenderGame, selectedObject } from './stores'

  function clickTick() {
    tick()
    rerenderGame()
  }

</script>

<button on:click={clickTick}>Tick</button>
<div>
  {#if $selectedObject}
    <h2>{$selectedObject.type.name}</h2>
    <div>ID: {$selectedObject.id}</div>
    <h3>Inventory</h3>
    <Inventory container={$selectedObject}/>
  {/if}
</div>

