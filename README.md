# Game

An untitled, open world RPG in early development. *Give me a name!*

## Concept
The goal is to create a role-playing game, and a supporting game engine, that allows for a high degree of player freedom and interactivity. 
* **UI-based.** By using menus, text, and images to present the game, rather than 3D graphics, a deep level of gameplay is achievable. We use a front-end framework to create a modern UI that is intuitive to use, and gives the player fine-grained control over their environment.

* **World as a Network.** The game world is represeted with nodes, such as rooms and areas of interest, that are connected to each other via paths. The world can consist of hundreds or thousands of nodes, that are arranged in the world via a [force-directed graph](https://github.com/d3/d3-force) to create a pleasing navigatable map.

* **Tick-based Time.** World time is simulated in one-second intervals. When the player starts an action, such as picking up an item or attacking a creature, the entire world is simulated during this time. This contrasts the majority of UI-based RPGs which are turn-based.

* **Reactive World.** Due to the abstracted, computationally cheap representation of space, we can simulate the entire world every tick of time. We combine this feature with NPCs that interact with their environment to allow for an ever-changing game world.


## Contributing
The project is developed with [Typescript](https://www.typescriptlang.org/) and [Svelte](https://svelte.dev/),and is built with [Vite](https://vitejs.dev/). To start a development server, install [Node.js](https://nodejs.org) and simply run
1. `npm install`
2. `npm run dev`

To create a production build, execute `npm run build`

Unit testing is not included, but will be added at a later date when theproject reaches a more stable state.
