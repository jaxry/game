<script lang="ts">
  import type { GameObject } from '../GameObject'
  import ObjectInSpot from './ObjectInSpot.svelte'
  import { playerMoveToSpot} from '../behavior/player'

  export let zone: GameObject

  $: spots = groupBySpots(zone)

  function groupBySpots(zone: GameObject): GameObject[][] {
    const spots = [[], [], [], [], []]
    for (const obj of zone.contains) {
      spots[obj.spot].push(obj)
    }
    return spots
  }

  function clickSpot(spot) {
    playerMoveToSpot(spot)
  }
</script>

<div class='spots'>
  {#each spots as spot, i}
    <div class='spot' on:click|self={() => clickSpot(i)}>
      {#each spot as obj (obj)}
        <ObjectInSpot {obj} />
      {/each}
    </div>
  {/each}
</div>

<style>
  .spots {
    display: flex;
  }

  .spot {
    min-width: 10rem;
    padding: 1rem;
    border-right: var(--border);
    user-select: none;
    cursor: pointer;
  }

  .spot:hover {
    background: var(--hover);
  }

  .spot:first-child {
    border-left: var(--border);
  }
</style>