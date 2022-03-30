<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import ObjectTile from './ObjectCard.svelte'
  import { playerMoveToSpot } from '../behavior/player'
  import { elements, game, setSelectedObject } from './stores'
  import { flip } from 'svelte/animate'
  import { fade } from 'svelte/transition'
  import crossfade from './crossfade'
  import { zoneState } from './Zone.ts'
  import { afterUpdate, tick } from 'svelte'

  $: zone = $game.player.container
  $: spots = groupBySpots(zone)

  let container: HTMLElement
  $: {
    if (container) {
      elements.zone = container
    }
  }

  const animDuration = 200

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

  const [gameObjectSend, gameObjectReceive] = crossfade({
    fallback: (node: Element, params: any) => {
      params.delay = zoneState.animationDelay
      params.duration = animDuration
      return fade(node, params)
    },
    duration: animDuration,
    delay: () => zoneState.animationDelay
  })

  function animateObjects(node: Element, fromTo: any, params: { delay: number }) {
    params.delay = (params.delay ?? 0) + zoneState.animationDelay
    return flip(node, fromTo, params)
  }

  function transitionZone(node: Element, params: any, intro: boolean) {
    params.delay = (params.delay ?? 0) + zoneState.animationDelay
    return fade(node, params)
  }

  afterUpdate(async () => {
    await tick()
    zoneState.animationDelay = 0
  })

</script>

{#key zone.id}
  <div class='spots'
       bind:this={container}
       out:transitionZone={{duration: animDuration}}
       in:transitionZone={{duration: animDuration, delay: animDuration}}
  >
    {#each spots as spot, i}
      <div class='spot'>
        <div class='objects' on:click={selectZone}>
          {#each spot as object (object)}
            <div
                animate:animateObjects={{duration: animDuration, delay: 2 * animDuration}}
                in:gameObjectReceive|local={{key: object}}
                out:gameObjectSend|local={{key: object}}>
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