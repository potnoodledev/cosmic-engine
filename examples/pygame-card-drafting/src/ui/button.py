import pygame

class Button:
    """
    A button UI component.
    """
    
    def __init__(self, x, y, width, height, text, callback=None, text_color=(255, 255, 255), 
                 bg_color=(100, 100, 100), hover_color=(150, 150, 150), 
                 border_color=(200, 200, 200), border_width=2, border_radius=10):
        """
        Initialize a button.
        
        Args:
            x: The x position of the button's center
            y: The y position of the button's center
            width: The width of the button
            height: The height of the button
            text: The text to display on the button
            callback: Function to call when the button is clicked
            text_color: The color of the text
            bg_color: The background color of the button
            hover_color: The background color when the mouse is over the button
            border_color: The color of the button's border
            border_width: The width of the button's border
            border_radius: The radius of the button's rounded corners
        """
        self.rect = pygame.Rect(x - width // 2, y - height // 2, width, height)
        self.text = text
        self.callback = callback
        self.text_color = text_color
        self.bg_color = bg_color
        self.hover_color = hover_color
        self.border_color = border_color
        self.border_width = border_width
        self.border_radius = border_radius
        self.hovered = False
        self.clicked = False
        
        # Create font if not provided
        self.font = pygame.font.SysFont('Arial', 24)
        
        # Pre-render the text
        self.text_surface = self.font.render(self.text, True, self.text_color)
        self.text_rect = self.text_surface.get_rect(center=self.rect.center)
    
    def update(self, mouse_pos, mouse_pressed):
        """
        Update the button state.
        
        Args:
            mouse_pos: The current mouse position
            mouse_pressed: Whether the mouse button is pressed
            
        Returns:
            True if the button was clicked, False otherwise
        """
        self.hovered = self.rect.collidepoint(mouse_pos)
        
        # Check if the button was clicked
        if self.hovered and mouse_pressed[0] and not self.clicked:
            self.clicked = True
            if self.callback:
                self.callback()
            return True
        
        # Reset clicked state when mouse is released
        if not mouse_pressed[0]:
            self.clicked = False
        
        return False
    
    def is_clicked(self, mouse_pos):
        """
        Check if the button is clicked at the given position.
        
        Args:
            mouse_pos: The mouse position to check
            
        Returns:
            True if the button was clicked, False otherwise
        """
        return self.rect.collidepoint(mouse_pos)
    
    def on_click(self):
        """
        Handle the button click event.
        """
        if self.callback:
            self.callback()
    
    def draw(self, surface):
        """
        Draw the button on the given surface.
        
        Args:
            surface: The pygame surface to draw on
        """
        # Draw button background
        color = self.hover_color if self.hovered else self.bg_color
        pygame.draw.rect(surface, color, self.rect, border_radius=self.border_radius)
        
        # Draw button border
        pygame.draw.rect(surface, self.border_color, self.rect, self.border_width, border_radius=self.border_radius)
        
        # Draw button text
        surface.blit(self.text_surface, self.text_rect) 