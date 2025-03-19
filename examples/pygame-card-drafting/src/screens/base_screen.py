import pygame

class BaseScreen:
    """
    Base class for all game screens.
    """
    
    def __init__(self, screen, game_state):
        """
        Initialize the screen.
        
        Args:
            screen: The pygame surface to draw on
            game_state: The current game state
        """
        self.screen = screen
        self.game_state = game_state
        self.width, self.height = screen.get_size()
        
        # Colors
        self.BLACK = (0, 0, 0)
        self.WHITE = (255, 255, 255)
        self.GRAY = (150, 150, 150)
        self.DARK_GRAY = (50, 50, 50)
        self.LIGHT_GRAY = (200, 200, 200)
        self.BLUE = (0, 0, 255)
        self.DARK_BLUE = (0, 0, 150)
        self.RED = (255, 0, 0)
        self.GREEN = (0, 255, 0)
        
        # Fonts
        self.title_font = pygame.font.SysFont('Arial', 48)
        self.subtitle_font = pygame.font.SysFont('Arial', 36)
        self.text_font = pygame.font.SysFont('Arial', 24)
        self.small_font = pygame.font.SysFont('Arial', 18)
    
    def handle_event(self, event):
        """
        Handle pygame events.
        
        Args:
            event: The pygame event to handle
            
        Returns:
            The next screen to display, or None to stay on the current screen
        """
        return None
    
    def update(self):
        """
        Update the screen state.
        """
        pass
    
    def draw(self):
        """
        Draw the screen.
        """
        # Clear the screen
        self.screen.fill(self.BLACK)
    
    def draw_text(self, text, font, color, x, y, align="left"):
        """
        Draw text on the screen.
        
        Args:
            text: The text to draw
            font: The font to use
            color: The color to use
            x, y: The position to draw at
            align: The alignment (left, center, right)
        """
        text_surface = font.render(text, True, color)
        text_rect = text_surface.get_rect()
        
        if align == "center":
            text_rect.center = (x, y)
        elif align == "right":
            text_rect.right = x
            text_rect.top = y
        else:  # left
            text_rect.left = x
            text_rect.top = y
            
        self.screen.blit(text_surface, text_rect)
        return text_rect 