<script lang='ts'>
  import { game } from './stores'
  import Inventory from './Inventory.svelte'
  import SelectedObject from './SelectedObject.svelte'
  import Log from './Log.svelte'
  import Map from './Map.svelte'
  import Player from './Player.svelte'
</script>

<main>
  <div class='global'>
    <h2 class='time'>{$game.time.getTimeOfDay()}</h2>
  </div>

  <div class='map'>
    <Map/>
  </div>

  <div class='zone'>
    <h2>{$game.player.container.type.name}</h2>
    {#if $game.player.container.type.description}
      <div class='description'>{$game.player.container.type.description}</div>
    {/if}
  </div>

  <div class='zoneInventory'>
    <Inventory container={$game.player.container}/>
  </div>

  <div class='player'>
    <Player/>
  </div>
  <div class='playerInventory'>
    <Inventory container={$game.player}/>
  </div>

  <div class='selectedObject'>
    <SelectedObject/>
  </div>

  <div class='log'>
    <Log/>
  </div>

</main>

<style>
  main {
    height: 100%;
    display: grid;
    grid-template-columns: 16rem 1fr 1fr;
    grid-template-rows: min-content auto auto fit-content(25vmin) 16rem;
    grid-template-areas:
      'global zone player'
      'global zoneInv playerInv'
      'global zoneInv playerInv'
      'global selected  selected'
      'map    log       log';
  }

  main > * {
    overflow: auto;
  }

  .global {
    grid-area: global;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    border-right: var(--border);
  }

  .log {
    grid-area: log;
    border-top: var(--border);
    border-left: var(--border);
  }

  .map {
    grid-area: map;
  }

  .player {
    grid-area: player;
    background: #282828;
  }

  .playerInventory {
    grid-area: playerInv;
  }

  .zone {
    grid-area: zone;
    border-right: var(--border);
    background: #282828;
  }

  .zoneInventory {
    grid-area: zoneInv;
    border-right: var(--border);
  }

  .selectedObject {
    grid-area: selected;
    border-top: var(--border);
  }

  .description {
    font-style: italic;
  }
</style>