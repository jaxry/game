<script lang='ts'>
  import type { GameObject } from '../GameObject'
  import ObjectCard from './ObjectCard.svelte'
  import { playerMoveToSpot } from '../behavior/player'
  import { game, setSelectedObject } from './stores'
  import type Action from '../behavior/Action'
  import { onMount } from 'svelte'
  import ActionTargetAnimation from './ActionTargetAnimation.svelte'
  import { Effect } from '../behavior/Effect'
  import { crossfade, fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';


  let player: GameObject
  let spots: GameObject[][]
  let zone: GameObject
  let actions: Action[] = []

  $: {
    player = $game.player

    function updateZone() {
      zone = player.container
      spots = groupBySpots(zone)
    }

    if (actions.length > 0) {
      const duration = animateActions()
      actions.length = 0
      setTimeout(updateZone, duration)
    } else {
      updateZone()
    }
  }

  function groupBySpots(zone: GameObject): GameObject[][] {
    const spots = [[], [], [], [], []]
    for (const obj of zone.contains) {
      spots[obj.spot].push(obj)
    }
    return spots
  }

  function deselect() {
    setSelectedObject(null)
  }

  let container: HTMLElement
  const cards = {}

  function animateActions() {
    const duration = 1000
    let elapsed = 0

    for (const action of actions) {
      console.log(cards, action.object.id, action.target.id)
      setTimeout(() => {
        const elem = new ActionTargetAnimation({
          target: container,
          props: {
            action,
            duration,
            from: cards[action.object.id],
            to: cards[action.target.id],
            destroy: () => elem.$destroy()
          }
        })
      }, elapsed - duration / 2)

      elapsed += elapsed === 0 ? duration : duration / 2
    }

    return elapsed
  }
  
  class ActionAnimEffect extends Effect {
    override onActivate() {
      this.onEvent(this.object.container, 'itemActionFinish', ({action}) => {
        if (action.target) {
          actions.push(action)
        }
      })

      this.onEvent(this.object, 'move', () => {
        this.deactivate().activate()
      })
    }
  }
  onMount(() => {
    const effect = new ActionAnimEffect(player).activate()
    return () => {
      effect.deactivate()
    }
  })

  const [gameObjectSend, gameObjectReceive] = crossfade({
    fallback: fade,
    duration: 200
  })

</script>

<div bind:this={container} class='spots'>
  {#each spots as spot, i}
    <div class='spot'>
      <div class='objects' on:click={deselect}>
        {#each spot as object (object)}
          <div
              animate:flip={{duration: 200}}
              in:gameObjectReceive={{key: object}}
              out:gameObjectSend={{key: object}}>
            <ObjectCard {object} bind:this={cards[object.id]}/>
          </div>
        {/each}
      </div>
      {#if i !== player.spot}
        <button class='move' on:click={() => playerMoveToSpot(i)}>Move</button>
      {/if}
    </div>
  {/each}
</div>

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
</style>