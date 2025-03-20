# Cosmic Engine

![Cosmic Engine](assets/banner.png)

### ✨ From Vibe Coding to Living Games 

Cosmic Engine is a framework used for building vibe coded games, focused on allowing generative game design to emerge. 

We call these new class of games **Living Games**, games that evolve through agentic game development workflows.

## Prerequisites

* [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

* [Python 2.7+](https://www.python.org/)

* [Cursor IDE](https://www.cursor.com/)

* [Excalidraw Plugin](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor)

#### API Keys (Needed for examples; copy .env to specific tool folders)

* [Hugging Face](https://huggingface.co/)
* [OpenAI](https://platform.openai.com/api-keys)
* [Gemini](https://aistudio.google.com/apikey)
* [X](https://developer.x.com/)

## Getting Started

#### Check out the repository
```bash
git clone https://github.com/potnoodledev/cosmic-engine.git
cd cosmic-engine
```

#### Create a .env file and input your API keys

```bash
cp .env.example .env
````

#### Install libraries and start the example apps

```bash
npm i
npm start
```

## Creating your First Game

A good way to get started with a living game concept is to start simple: define mechanics first before story and have a clear vision of how the game will look like in its first iteration.

* Start with creating an excalidraw SVG file containing your concept, you can use the example concepts as guidelines:

![Concept](/examples/pygame-card-drafting/concept.excalidraw.svg)

* Once you have an initial design, attach the excalidraw to your agent's context, and enter the prompt:
````
Create the game in the attached concept
````

The [.cursorrules](.cursorrules) will guide the LLM to use the recommended Cosmic Engine stack.


## Documentation

The [docs](/docs/) folder contains the [Developer Documentation](https://docs.cosmiclabs.org), with more in-depth discussion on how to build Living Games

## PotNoodleDev

As part of the living game experiment, Cosmic Labs is also building [PotNoodleDev](https://cosmic-engine.gitbook.io/potnoodledev): an agentic game developer built on Cosmic Engine and  [Virtuals](https://virtuals.io).


## Contributing

Thank you for helping build Cosmic Engine! To contribute, please follow the guidelines below:

* For bug fixes or documentation updates, simply do a pull request
* If you're contributing tools or examples, please place them in their appropriate folders
* For more complicated additions or feature proposals, please create an issue first to discuss how it can be best added to the framework