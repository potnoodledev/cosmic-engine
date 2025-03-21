import pygame
import random
import sys
import math

# Initialize Pygame
pygame.init()

# Constants
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
GRID_SIZE = 8  # 8x8 grid
CELL_SIZE = 70  # Size of each cell in pixels
GRID_OFFSET_X = (WINDOW_WIDTH - GRID_SIZE * CELL_SIZE) // 2
GRID_OFFSET_Y = 100
ANIMATION_SPEED = 10  # Speed of animations
SWAP_ANIMATION_SPEED = 5  # Speed of swap animations
FALL_SPEED = 15  # Speed of falling gems

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GRAY = (100, 100, 100)
BACKGROUND_COLOR = (50, 10, 70)  # Dark purple background

# Gem colors
GEM_COLORS = {
    "ruby": (220, 20, 60),      # Red
    "sapphire": (30, 144, 255),  # Blue
    "emerald": (50, 205, 50),    # Green
    "topaz": (255, 215, 0),      # Yellow
    "amethyst": (138, 43, 226),  # Purple
    "diamond": (220, 220, 255)   # White/Rainbow
}

# Set up the display
screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Gem Fusion Quest")
clock = pygame.time.Clock()

# Font setup
font = pygame.font.Font(None, 36)
small_font = pygame.font.Font(None, 24)

class Gem:
    def __init__(self, row, col, gem_type=None):
        self.row = row
        self.col = col
        self.gem_type = gem_type if gem_type else random.choice(list(GEM_COLORS.keys()))
        self.x = GRID_OFFSET_X + col * CELL_SIZE
        self.y = GRID_OFFSET_Y + row * CELL_SIZE
        self.target_x = self.x
        self.target_y = self.y
        self.is_moving = False
        self.is_special = False
        self.special_type = None
        self.is_selected = False
        self.is_matched = False
        self.alpha = 255  # For fade animations
        self.scale = 1.0  # For scale animations
        
    def update(self):
        # Handle movement animation
        if self.is_moving:
            dx = self.target_x - self.x
            dy = self.target_y - self.y
            
            if abs(dx) < ANIMATION_SPEED and abs(dy) < ANIMATION_SPEED:
                self.x = self.target_x
                self.y = self.target_y
                self.is_moving = False
            else:
                self.x += dx * 0.2
                self.y += dy * 0.2
                
        # Handle matched gems fading out
        if self.is_matched:
            self.alpha = max(0, self.alpha - 15)
            self.scale = max(0.1, self.scale - 0.05)
            
    def draw(self):
        color = GEM_COLORS[self.gem_type]
        
        # Apply alpha for fading
        color_with_alpha = (*color, self.alpha)
        
        # Calculate size based on scale
        size = int(CELL_SIZE * 0.8 * self.scale)
        
        # Create a surface with per-pixel alpha
        gem_surface = pygame.Surface((size, size), pygame.SRCALPHA)
        
        # Draw the gem shape
        if self.special_type == "line":
            # Line-clearing gem (square with line)
            pygame.draw.rect(gem_surface, color_with_alpha, (0, 0, size, size), border_radius=size//5)
            pygame.draw.line(gem_surface, WHITE, (size//4, size//2), (size*3//4, size//2), 3)
        elif self.special_type == "bomb":
            # Explosive gem (circle)
            pygame.draw.circle(gem_surface, color_with_alpha, (size//2, size//2), size//2)
            # Add small white circles to indicate explosive
            for i in range(4):
                angle = i * math.pi / 2
                x = size//2 + int(math.cos(angle) * size//3)
                y = size//2 + int(math.sin(angle) * size//3)
                pygame.draw.circle(gem_surface, WHITE, (x, y), size//10)
        elif self.special_type == "color_bomb":
            # Color bomb (star shape approximated by a circle with spikes)
            pygame.draw.circle(gem_surface, color_with_alpha, (size//2, size//2), size//2)
            # Add rainbow effect
            for i in range(6):
                angle = i * math.pi / 3
                x1 = size//2
                y1 = size//2
                x2 = size//2 + int(math.cos(angle) * size//2)
                y2 = size//2 + int(math.sin(angle) * size//2)
                rainbow_color = list(GEM_COLORS.values())[i % len(GEM_COLORS)]
                pygame.draw.line(gem_surface, rainbow_color, (x1, y1), (x2, y2), 3)
        else:
            # Regular gem (rounded rectangle)
            pygame.draw.rect(gem_surface, color_with_alpha, (0, 0, size, size), border_radius=size//5)
        
        # Add highlight for selected gems
        if self.is_selected:
            pygame.draw.rect(gem_surface, WHITE, (0, 0, size, size), 3, border_radius=size//5)
        
        # Calculate position to center the gem in its cell
        pos_x = self.x + (CELL_SIZE - size) // 2
        pos_y = self.y + (CELL_SIZE - size) // 2
        
        # Draw the gem
        screen.blit(gem_surface, (pos_x, pos_y))
        
    def set_position(self, row, col):
        self.row = row
        self.col = col
        self.target_x = GRID_OFFSET_X + col * CELL_SIZE
        self.target_y = GRID_OFFSET_Y + row * CELL_SIZE
        self.is_moving = True
        
    def move_to(self, x, y):
        self.target_x = x
        self.target_y = y
        self.is_moving = True
        
    def make_special(self, special_type):
        self.is_special = True
        self.special_type = special_type

class Board:
    def __init__(self):
        self.grid = [[None for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
        self.selected_gem = None
        self.swapping_gems = None
        self.is_checking_matches = False
        self.is_refilling = False
        self.score = 0
        self.moves_left = 30
        self.level = 1
        self.gems_to_remove = []  # Track gems that need to be removed
        self.initialize_board()
        
    def initialize_board(self):
        # Create initial gems
        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                # Create a gem with a random type, but ensure no initial matches
                gem_type = self.get_random_gem_type(row, col)
                self.grid[row][col] = Gem(row, col, gem_type)
                
    def get_random_gem_type(self, row, col):
        # Get a random gem type that doesn't create an initial match
        available_types = list(GEM_COLORS.keys())
        
        # Check horizontal matches
        if col >= 2:
            if self.grid[row][col-1] and self.grid[row][col-2]:
                if self.grid[row][col-1].gem_type == self.grid[row][col-2].gem_type:
                    if self.grid[row][col-1].gem_type in available_types:
                        available_types.remove(self.grid[row][col-1].gem_type)
        
        # Check vertical matches
        if row >= 2:
            if self.grid[row-1][col] and self.grid[row-2][col]:
                if self.grid[row-1][col].gem_type == self.grid[row-2][col].gem_type:
                    if self.grid[row-1][col].gem_type in available_types:
                        available_types.remove(self.grid[row-1][col].gem_type)
        
        # If no available types (rare case), just return a random one
        if not available_types:
            return random.choice(list(GEM_COLORS.keys()))
            
        return random.choice(available_types)
        
    def update(self):
        # Update all gems
        any_moving = False
        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                if self.grid[row][col]:
                    self.grid[row][col].update()
                    if self.grid[row][col].is_moving:
                        any_moving = True
        
        # Handle swapping animation
        if self.swapping_gems:
            gem1, gem2 = self.swapping_gems
            if not gem1.is_moving and not gem2.is_moving:
                # Swap completed
                self.grid[gem1.row][gem1.col] = gem1
                self.grid[gem2.row][gem2.col] = gem2
                self.swapping_gems = None
                self.is_checking_matches = True
        
        # Check for matches after animations complete
        if self.is_checking_matches and not any_moving:
            matches = self.find_matches()
            if matches:
                self.handle_matches(matches)
            else:
                # If no matches after a swap, swap back if this was from a player swap
                if self.swapping_gems:
                    gem1, gem2 = self.swapping_gems
                    self.swap_gems(gem1, gem2)
                    self.swapping_gems = None
                self.is_checking_matches = False
        
        # Remove matched gems if their animation is complete
        self.remove_completed_matches()
        
        # Handle falling gems and refilling
        if not any_moving and not self.is_checking_matches:
            if self.apply_gravity():
                # Gems are falling
                pass
            elif self.is_refilling:
                # Refill empty spaces
                self.refill_board()
                self.is_refilling = False
                self.is_checking_matches = True  # Check for new matches after refilling
        
    def remove_completed_matches(self):
        # Remove gems that have completed their fade-out animation
        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                if self.grid[row][col] and self.grid[row][col].is_matched and self.grid[row][col].alpha <= 0:
                    self.grid[row][col] = None
                    self.is_refilling = True  # Set flag to apply gravity and refill
        
    def draw(self):
        # Draw the grid background
        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                x = GRID_OFFSET_X + col * CELL_SIZE
                y = GRID_OFFSET_Y + row * CELL_SIZE
                color = GRAY if (row + col) % 2 == 0 else BLACK
                pygame.draw.rect(screen, color, (x, y, CELL_SIZE, CELL_SIZE))
                pygame.draw.rect(screen, WHITE, (x, y, CELL_SIZE, CELL_SIZE), 1)
        
        # Draw all gems
        for row in range(GRID_SIZE):
            for col in range(GRID_SIZE):
                if self.grid[row][col]:
                    self.grid[row][col].draw()
        
        # Draw UI elements
        self.draw_ui()
        
    def draw_ui(self):
        # Draw score
        score_text = font.render(f"Score: {self.score}", True, WHITE)
        screen.blit(score_text, (20, 20))
        
        # Draw moves left
        moves_text = font.render(f"Moves: {self.moves_left}", True, WHITE)
        screen.blit(moves_text, (20, 60))
        
        # Draw level
        level_text = font.render(f"Level: {self.level}", True, WHITE)
        screen.blit(level_text, (WINDOW_WIDTH - 150, 20))
        
    def handle_click(self, pos):
        if self.is_checking_matches or self.is_refilling or any(self.grid[row][col] and self.grid[row][col].is_moving for row in range(GRID_SIZE) for col in range(GRID_SIZE)):
            return  # Don't handle clicks during animations
            
        # Convert click position to grid coordinates
        col = (pos[0] - GRID_OFFSET_X) // CELL_SIZE
        row = (pos[1] - GRID_OFFSET_Y) // CELL_SIZE
        
        # Check if click is within grid bounds
        if 0 <= row < GRID_SIZE and 0 <= col < GRID_SIZE and self.grid[row][col]:
            if self.selected_gem is None:
                # First selection
                self.grid[row][col].is_selected = True
                self.selected_gem = self.grid[row][col]
            else:
                # Second selection - check if it's adjacent to the first
                if self.are_adjacent(self.selected_gem, self.grid[row][col]):
                    # Swap the gems
                    self.swap_gems(self.selected_gem, self.grid[row][col])
                    self.moves_left -= 1
                    self.selected_gem.is_selected = False
                    self.selected_gem = None
                else:
                    # Not adjacent, deselect first and select new
                    self.selected_gem.is_selected = False
                    self.grid[row][col].is_selected = True
                    self.selected_gem = self.grid[row][col]
                    
    def are_adjacent(self, gem1, gem2):
        # Check if two gems are adjacent (horizontally or vertically)
        return (abs(gem1.row - gem2.row) == 1 and gem1.col == gem2.col) or \
               (abs(gem1.col - gem2.col) == 1 and gem1.row == gem2.row)
               
    def swap_gems(self, gem1, gem2):
        # Swap positions in the grid
        self.grid[gem1.row][gem1.col] = gem2
        self.grid[gem2.row][gem2.col] = gem1
        
        # Swap row and col attributes
        gem1.row, gem2.row = gem2.row, gem1.row
        gem1.col, gem2.col = gem2.col, gem1.col
        
        # Update target positions for animation
        gem1.target_x = GRID_OFFSET_X + gem1.col * CELL_SIZE
        gem1.target_y = GRID_OFFSET_Y + gem1.row * CELL_SIZE
        gem2.target_x = GRID_OFFSET_X + gem2.col * CELL_SIZE
        gem2.target_y = GRID_OFFSET_Y + gem2.row * CELL_SIZE
        
        gem1.is_moving = True
        gem2.is_moving = True
        
        # Store the swapping gems to check for matches after animation
        self.swapping_gems = (gem1, gem2)
        
    def find_matches(self):
        matches = []
        
        # Check horizontal matches
        for row in range(GRID_SIZE):
            col = 0
            while col < GRID_SIZE - 2:
                if self.grid[row][col] and self.grid[row][col+1] and self.grid[row][col+2]:
                    if self.grid[row][col].gem_type == self.grid[row][col+1].gem_type == self.grid[row][col+2].gem_type:
                        # Found a horizontal match of at least 3
                        match_length = 3
                        while col + match_length < GRID_SIZE and self.grid[row][col+match_length] and \
                              self.grid[row][col].gem_type == self.grid[row][col+match_length].gem_type:
                            match_length += 1
                        
                        # Add the match to our list
                        match = [(row, col+i) for i in range(match_length)]
                        matches.append(match)
                        col += match_length
                    else:
                        col += 1
                else:
                    col += 1
        
        # Check vertical matches
        for col in range(GRID_SIZE):
            row = 0
            while row < GRID_SIZE - 2:
                if self.grid[row][col] and self.grid[row+1][col] and self.grid[row+2][col]:
                    if self.grid[row][col].gem_type == self.grid[row+1][col].gem_type == self.grid[row+2][col].gem_type:
                        # Found a vertical match of at least 3
                        match_length = 3
                        while row + match_length < GRID_SIZE and self.grid[row+match_length][col] and \
                              self.grid[row][col].gem_type == self.grid[row+match_length][col].gem_type:
                            match_length += 1
                        
                        # Add the match to our list
                        match = [(row+i, col) for i in range(match_length)]
                        matches.append(match)
                        row += match_length
                    else:
                        row += 1
                else:
                    row += 1
        
        # Check for L-shapes and other special patterns
        self.check_special_patterns(matches)
        
        return matches
        
    def check_special_patterns(self, matches):
        # This is a simplified version - in a full game, you'd check for T, L shapes, etc.
        # For now, we'll just identify matches of 4 or 5 for special gems
        
        for match in matches:
            if len(match) == 4:
                # Mark the first gem in a 4-match for upgrade to line-clearing gem
                row, col = match[0]
                if self.grid[row][col]:
                    self.grid[row][col].make_special("line")
            elif len(match) == 5:
                # Mark the first gem in a 5-match for upgrade to color bomb
                row, col = match[0]
                if self.grid[row][col]:
                    self.grid[row][col].make_special("color_bomb")
        
    def handle_matches(self, matches):
        # Mark matched gems
        matched_positions = set()
        for match in matches:
            for row, col in match:
                if self.grid[row][col]:
                    self.grid[row][col].is_matched = True
                    matched_positions.add((row, col))
        
        # Calculate score based on matches
        match_count = len(matched_positions)
        points = match_count * 10  # Base points
        
        # Bonus for longer matches
        for match in matches:
            if len(match) > 3:
                points += (len(match) - 3) * 20  # Bonus for each gem beyond 3
        
        self.score += points
        
    def remove_matched_gems(self):
        # This method is no longer needed as we're removing gems in remove_completed_matches
        # when their fade animation is complete
        pass
        
    def apply_gravity(self):
        # Move gems down to fill empty spaces
        moved = False
        for col in range(GRID_SIZE):
            for row in range(GRID_SIZE-1, -1, -1):
                if self.grid[row][col] is None:
                    # Find the highest gem above this empty space
                    for above_row in range(row-1, -1, -1):
                        if self.grid[above_row][col]:
                            # Move this gem down
                            self.grid[row][col] = self.grid[above_row][col]
                            self.grid[above_row][col] = None
                            self.grid[row][col].set_position(row, col)
                            moved = True
                            break
        return moved
        
    def refill_board(self):
        # Add new gems to empty spaces at the top
        for col in range(GRID_SIZE):
            for row in range(GRID_SIZE):
                if self.grid[row][col] is None:
                    # Create a new gem above the board
                    new_gem = Gem(row, col)
                    new_gem.y = GRID_OFFSET_Y - CELL_SIZE * (row + 1)  # Start higher for a nicer falling effect
                    new_gem.target_y = GRID_OFFSET_Y + row * CELL_SIZE
                    new_gem.is_moving = True
                    self.grid[row][col] = new_gem
        
    def check_game_over(self):
        return self.moves_left <= 0

def main():
    board = Board()
    running = True
    game_over = False

    while running:
        # Event handling
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN and not game_over:
                board.handle_click(event.pos)
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif event.key == pygame.K_r:
                    # Reset the game
                    board = Board()
                    game_over = False

        # Game logic
        if not game_over:
            board.update()
            game_over = board.check_game_over()

        # Drawing
        screen.fill(BACKGROUND_COLOR)
        board.draw()
        
        if game_over:
            # Display game over screen
            overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 180))  # Semi-transparent black
            screen.blit(overlay, (0, 0))
            
            font_large = pygame.font.Font(None, 72)
            game_over_text = font_large.render('Game Over!', True, WHITE)
            score_text = font.render(f'Final Score: {board.score}', True, WHITE)
            restart_text = font.render('Press R to Restart', True, WHITE)
            
            screen.blit(game_over_text, (WINDOW_WIDTH//2 - game_over_text.get_width()//2, WINDOW_HEIGHT//2 - 80))
            screen.blit(score_text, (WINDOW_WIDTH//2 - score_text.get_width()//2, WINDOW_HEIGHT//2))
            screen.blit(restart_text, (WINDOW_WIDTH//2 - restart_text.get_width()//2, WINDOW_HEIGHT//2 + 60))

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main() 