<script lang='ts'>
  import { game } from './stores'
  import Map from './Map.svelte'
  import Zone from './Zone.svelte'
  import Action from './Action.svelte'
</script>

<main>
  <div class='global'>
    {#if $game.player.activeAction}
      <Action action={$game.player.activeAction}/>
    {/if}
    <h2 class='time'>{$game.time.getTimeOfDay()}</h2>
  </div>

  <div class='map'>
    <Map/>
  </div>

  <div class='zone'>
    <Zone zone={$game.player.container}/>
  </div>
</main>

<style>
  main {
    height: 100%;

    display: grid;
    grid-template-columns: 16rem 1fr 1fr;
    grid-template-rows: 1fr 16rem;
    grid-template-areas:
      'global zone zone'
      'map    zone zone';
  }

  .global {
    grid-area: global;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    /*border-right: var(--border);*/
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
  }

  .playerInventory {
    grid-area: playerInv;
  }

  .zone {
    grid-area: zone;
    display: flex;
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