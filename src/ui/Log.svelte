<script lang='ts'>
  import { fade } from 'svelte/transition'
  import { isGameObject } from '../GameObject'
  import { dragAndDropGameObject, game, selectedObject, setSelectedObject } from './stores'
  import { activatePlayerAction } from '../behavior/core'
  import { afterUpdate } from 'svelte'
  import Action from './Action.svelte'

  let container: HTMLElement
  let lastHeight = 0
  afterUpdate(() => {
    const thisHeight = container.scrollHeight
    if (lastHeight !== thisHeight) {
      container.scrollTo({
        top: thisHeight,
        left: 0,
        behavior: 'smooth',
      })
      lastHeight = thisHeight
    }
  })

</script>


<div bind:this={container} class='container'>
  {#each $game.log.entries as entry, i (entry)}

    <div class='message' class:player={entry.player}
         in:fade={{duration: 100, delay: 100}}
         out:fade={{duration: 100}}>
      {#each entry.message as part}
        {#if part === $game.player}
          <span class='player'>you</span>
        {:else if isGameObject(part)}
          <span
              class='gameObject'
              class:properNoun={part.type.properNoun}
              class:selectedObject={$selectedObject === part}
              use:dragAndDropGameObject.drag={part}
              on:click={() => setSelectedObject(part)}>
            {part.type.properNoun ? `` : `the`} {part.type.name}
          </span>
        {:else}
          {part}
        {/if}
      {/each}
    </div>
  {/each}

  {#if $game.player.activeAction}
    {#if !$game.log.isFinished}
      <div class='message' in:fade={{duration: 100, delay: 100}}>
        <Action action={$game.player.activeAction}/>
      </div>
    {:else}
      <button on:click={() => activatePlayerAction()} class='message' in:fade={{duration: 100, delay: 200}}
              out:fade={{duration: 100}}>
        Continue
        <Action action={$game.player.activeAction}/>
      </button>
    {/if}
  {/if}
</div>


<style>
  .container {
    overflow: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .message {
    line-height: 2rem;
    font-size: 1.3rem;
  }

  .message:first-letter {
    text-transform: capitalize;
  }

  .player {
    color: var(--player);
    font-weight: bold;
  }

  .gameObject {
    color: #eee;
    font-weight: bolder;
    cursor: pointer;
    user-select: none;
  }

  .properNoun {
    text-transform: capitalize;
  }

  .selectedObject {
    color: var(--secondary);
  }
</style>