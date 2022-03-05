<script lang='ts'>
  import { game } from './stores'
  import Map from './Map.svelte'
  import Zone from './Zone.svelte'
  import Action from './Action.svelte'
  import SelectedObject from './SelectedObject.svelte'
</script>

<main>
  <div class='global'>
    <h2 class='time'>{$game.time.getTimeOfDay()}</h2>
  </div>

  <div class='map'>
    <Map/>
  </div>

  <div class='zone'>
    <Zone />
  </div>

  <div class='selectedObject'>
    <SelectedObject />
  </div>
</main>

<style>
  main {
    height: 100%;
    overflow: auto;
    display: grid;
    grid-template-columns: 16rem 1fr 1fr;
    grid-template-rows: 1fr 16rem;
    grid-template-areas:
      'global zone     zone'
      'map    selected selected';
  }

  .global {
    grid-area: global;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: end;
  }

  .map {
    grid-area: map;
  }

  .zone {
    grid-area: zone;
  }

  .selectedObject {
    grid-area: selected;
    border-top: var(--border);
  }
</style>