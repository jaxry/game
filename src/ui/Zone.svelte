<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import ObjectInSpot from './ObjectInSpot.svelte'
  import { playerMoveToSpot } from '../behavior/player'
  import { gameObjectAnimDuration, gameObjectReceive, gameObjectSend } from './stores'
  import { flip } from 'svelte/animate'

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
    <div class='spot'>
      <div class='background' on:click={() => clickSpot(i)}></div>
      <div class='objects'>
        {#each spot as obj (obj)}
          <div
              animate:flip={{duration: gameObjectAnimDuration}}
              in:gameObjectSend={{key: obj}}
              out:gameObjectReceive={{key: obj}}>
            <ObjectInSpot {obj}/>
          </div>
        {/each}
      </div>
    </div>

  {/each}
</div>

<style>
  .spots {
    display: flex;
  }

  .spot {
    position: relative;
    min-width: 10rem;
    border-right: var(--border);
  }

  .spot:first-child {
    border-left: var(--border);
  }

  .objects {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .background {
    position: absolute;
    inset: 0;
  }

  .background:hover {
    background: var(--lighter);
    cursor: pointer;
  }
</style>