# Crows - Card Drafting Game

A turn-based card drafting PVE game built with Pygame. In Crows, you start by choosing your "Alpha Crow" from a set of three random ones, each with unique capabilities that allow you to complete challenges and adopt a specific playstyle.

## Game Concept

Crows is a turn-based card drafting PVE game. At the start of the game, the player chooses their "Alpha Crow" from a set of three random ones. Each Crow has unique capabilities allowing you to complete challenges and adopt a specific playstyle.

## Installation

1. Make sure you have Python 3.7+ installed
2. Clone this repository
3. Install the required dependencies:

```
pip install -r requirements.txt
```

## Running the Game

### Desktop Version

To start the game on your desktop, run:

```
python main.py
```

### Web Version

To run the game in a web browser using pygbag:

1. Make sure pygbag is installed:
```
pip install pygbag
```

2. Run the web version:
```
python run_web.py
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

### Deploying to Web Platforms

To build the web version for deployment to platforms like itch.io:

1. Run the build script:
```
python build_web.py
```

2. This will create a `build/web` directory with all the necessary files and a `build/crows_web.zip` file that can be directly uploaded to itch.io or other web platforms.

### Deploying to itch.io

To automatically deploy your game to itch.io:

1. Make sure you have an itch.io account and have created a project for your game.

2. Run the deployment script:
```
python deploy_itch.py --username YOUR_ITCH_USERNAME --game YOUR_GAME_SLUG
```

For example:
```
python deploy_itch.py --username johndoe --game crows-card-game
```

3. The script will:
   - Check if butler (itch.io's command-line tool) is installed and install it if needed
   - Build the web version of your game
   - Log you into itch.io (first-time only)
   - Upload your game to itch.io

4. Optional parameters:
   - `--channel`: Specify a different channel (default is "web")

```
python deploy_itch.py --username johndoe --game crows-card-game --channel html5
```

## How to Play

1. **Choose your Alpha Crow**: At the start of the game, select one of the three Alpha Crows. Each has unique abilities that will influence your gameplay strategy.

2. **Build your team**: Draft cards to build your team of crows.

3. **Battle**: Use your Alpha Crow and team cards to defeat opponents.

## Game Controls

- **Mouse**: Click to select cards, buttons, and other UI elements.
- **ESC**: Exit the game.

## Development

This game is built with Pygame, a set of Python modules designed for writing video games.

### Project Structure

- `main.py`: The entry point of the desktop game
- `main_web.py`: The entry point for the web version
- `run_web.py`: Script to run the game with pygbag
- `build_web.py`: Script to build the web version for deployment
- `deploy_itch.py`: Script to automatically deploy the game to itch.io
- `src/`: Source code directory
  - `screens/`: Game screens (Alpha Crow selection, drafting, battle, etc.)
  - `models/`: Game models (Alpha Crow, Card, etc.)
  - `ui/`: UI components (Button, etc.)
  - `assets/`: Game assets (graphics, sounds, etc.)

## License

This project is open source and available under the MIT License. 