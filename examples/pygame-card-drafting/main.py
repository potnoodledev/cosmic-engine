import pygame
import sys
from src.screens.alpha_crow_selection import AlphaCrowSelectionScreen
from src.game_state import GameState

# Initialize pygame
pygame.init()

# Constants
SCREEN_WIDTH = 1200
SCREEN_HEIGHT = 800
TITLE = "Crows - Card Drafting Game"

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

# Quit pygame
pygame.quit()
sys.exit() 