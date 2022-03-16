<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import ObjectTile from './ObjectTile.svelte'
  import { playerMoveToSpot } from '../behavior/player'
  import { game, gameObjectReceive, gameObjectSend, setSelectedObject } from './stores'
  import { flip } from 'svelte/animate'
  import { fade } from 'svelte/transition'

  $: zone = $game.player.container
  $: spots = groupBySpots(zone)

  function groupBySpots(zone: GameObject): GameObject[][] {
    const spots = [[], [], [], [], []]
    for (const obj of zone.contains) {
      spots[obj.spot].push(obj)
    }
    return spots
  }

  function move(spot) {
    playerMoveToSpot(spot)
  }

  function selectZone() {
    setSelectedObject(null)
  }
</script>

{#key zone.id}
  <div class='spots' out:fade={{duration: 200}} in:fade={{duration: 200, delay: 200}}>
    {#each spots as spot, i}
      <div class='spot'>
        <div class='objects' on:click={selectZone}>
          {#each spot as object (object)}
            <div
                animate:flip
                in:gameObjectSend|local={{key: object}}
                out:gameObjectReceive|local={{key: object}}>
              <ObjectTile {object}/>
            </div>
          {/each}
        </div>
        {#if i !== $game.player.spot}
          <button class='move' on:click={() => move(i)}>Move</button>
        {/if}
      </div>
    {/each}

    <!--{#if $game.player.activeAction}-->
    <!--  <div class='playerAction'>-->
    <!--    <Action action={$game.player.activeAction} />-->
    <!--    Test-->
    <!--  </div>-->
    <!--{/if}-->
  </div>
{/key}


<style>
  .spots {
    position: relative;
    height: 100%;
    display: flex;
    justify-content: center;
  }

  .spot {
    position: relative;
    border-right: var(--border);
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
  }

  .spot:first-child {
    border-left: var(--border);
  }

  .objects {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .move {
    flex: 0 0 auto;
  }

  .playerAction {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 1.5rem;
    background: linear-gradient(transparent, var(--background));
    padding-top: 5rem;
    padding-bottom: 1rem;
  }
</style>