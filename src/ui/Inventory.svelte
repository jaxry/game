<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import TransferAction from '../actions/Transfer'
  import InventoryEntry from './InventoryEntry.svelte'
  import { dragAndDropGameObject, game } from './stores'
  import { activatePlayerAction } from '../behavior/core'

  export let container: GameObject

  let action: any

  function canTransfer(item: GameObject) {
    action = new TransferAction($game.player, item, container)
    if (action.condition()) {
      return 'move'
    }
  }

  function transfer() {
    activatePlayerAction(action)
  }

  const {dropAction, isDroppable} = dragAndDropGameObject.drop(canTransfer, transfer)
</script>

<div class='container' class:drop={$isDroppable} use:dropAction>
  {#each [...container.contains] as item (item)}
    {#if item !== $game.player}
      <InventoryEntry {item}/>
    {/if}
  {/each}
</div>

<style>
  .container {
    height: 100%;
    min-height: inherit;
    box-sizing: border-box;
    border: solid 2px transparent;
  }

  .drop {
    border: dotted 2px #888;
  }
</style>


