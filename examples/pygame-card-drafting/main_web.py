import pygame
import asyncio
import sys
from src.screens.alpha_crow_selection import AlphaCrowSelectionScreen
from src.game_state import GameState

# Constants
SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 800
TITLE = "Crows - Card Drafting Game"

async def main():
    # Initialize pygame
    pygame.init()
    
    # Create the game window
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption(TITLE)
    clock = pygame.time.Clock()
    
    # Create game state
    game_state = GameState()
    
    # Start with the alpha crow selection screen
    current_screen = AlphaCrowSelectionScreen(screen, game_state)
    
    # Main game loop
    running = True
    while running:
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            # Pass events to current screen
            next_screen = current_screen.handle_event(event)
            if next_screen:
                current_screen = next_screen
        
        # Update current screen
        current_screen.update()
        
        # Draw current screen
        current_screen.draw()
        
        # Update display
        pygame.display.flip()
        
        # Cap the frame rate
        clock.tick(60)
        
        # This is required for pygbag
        await asyncio.sleep(0)
    
    # Quit pygame
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    asyncio.run(main()) 