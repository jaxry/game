<script lang='ts'>
  import { elements, game, rerenderGame } from './stores'
  import Map from './Map.svelte'
  import Zone from './Zone.svelte'
  import SelectedObject from './SelectedObject.svelte'

  let container: HTMLElement

  $: {
    elements.main = container
  }

  $game.event.playerTick.on(() => {
    rerenderGame()
  })
</script>

<main bind:this={container}>
  <div class='global'>
    <h2 class='time'>{$game.time.getTimeOfDay()}</h2>
  </div>

  <div class='map'>
    <Map/>
  </div>

  <div class='zoneSpots'>
    <Zone/>
  </div>

  <div class='selectedObject'>
    <SelectedObject/>
  </div>
</main>

<style>
  main {
    height: 100%;
    display: grid;
    grid-template-columns: 16rem 1fr 1fr;
    grid-template-rows: 1fr 16rem;
    grid-template-areas:
      'global zoneSpots zoneSpots'
      'map    selected  selected';
  }

  main > * {
    overflow: hidden;
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

  .zoneSpots {
    grid-area: zoneSpots;
    border-bottom: var(--border);
  }

  .selectedObject {
    grid-area: selected;
  }

</style>