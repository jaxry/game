# Game

An untitled, open world RPG and ecosystem simulation in early development.

## Concept
The goal is to create a role-playing sandbox, and a supporting game engine, that allows for a high degree of player freedom and interactivity.
* **UI-based.** By using menus, text, and images to present the game world, focus can be put towards deep interactions between the player and the world that would normally be too difficult to implement in a 3D setting.

* **World as a Network.** The game world is represented with graph nodes (such as rooms and areas of interest), that are connected to each other via paths. The world can consist of hundreds or thousands of nodes, that are arranged in the world via a [force-directed graph](https://github.com/d3/d3-force) to create a pleasing navigable map.

* **Continuous Time.** World time is simulated fluidly. The player and other entities in the world can perform actions simultaneously that take any amount of time to complete. This contrasts the majority of UI-based RPGs which are turn-based.

* **Reactive World.** Due to the abstracted, computationally cheap representation of space, we can simulate the entire world all at once. We combine this feature with NPCs that interact with their environment to allow for an ever-changing game world.


## Contributing
The project is developed with [Typescript](https://www.typescriptlang.org/) and is built with [Vite](https://vitejs.dev/). To start a development server, install [Node.js](https://nodejs.org) and simply run
1. `npm install`
2. `npm run dev`

To create a production build, execute `npm run build`