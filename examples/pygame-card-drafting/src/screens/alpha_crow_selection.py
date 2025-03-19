import pygame
from src.screens.base_screen import BaseScreen
from src.models.alpha_crow import create_alpha_crows
from src.ui.button import Button

# Import the drafting screen
from src.screens.drafting_screen import DraftingScreen

class AlphaCrowSelectionScreen(BaseScreen):
    """
    Screen for selecting an Alpha Crow at the start of the game.
    """
    
    def __init__(self, screen, game_state):
        """
        Initialize the Alpha Crow selection screen.
        
        Args:
            screen: The pygame surface to draw on
            game_state: The current game state
        """
        super().__init__(screen, game_state)
        
        # Create the Alpha Crows
        self.alpha_crows = create_alpha_crows()
        
        # Currently selected crow (None until one is selected)
        self.selected_crow_index = None
        
        # Create the select button
        self.select_button = Button(
            self.width // 2,  # x (center)
            self.height - 100,  # y
            200,  # width
            60,   # height
            "Select Crow",
            None,  # No callback, we'll handle it manually
            bg_color=(70, 70, 120),
            hover_color=(90, 90, 150)
        )
        
        # Background color
        self.bg_color = (30, 30, 40)
        
        # Crow positions
        self.crow_positions = self._calculate_crow_positions()
        
        # Description box
        self.description_box_rect = pygame.Rect(
            self.width // 4,
            self.height - 250,
            self.width // 2,
            150
        )
    
    def _calculate_crow_positions(self):
        """
        Calculate the positions for displaying the Alpha Crows.
        
        Returns:
            A list of (x, y) positions for each crow
        """
        positions = []
        num_crows = len(self.alpha_crows)
        
        # Calculate horizontal spacing
        total_width = self.width * 0.8  # Use 80% of the screen width
        spacing = total_width / (num_crows + 1)
        
        # Y position (centered vertically in the top half)
        y = self.height // 3
        
        # Calculate positions
        for i in range(num_crows):
            x = spacing * (i + 1)
            positions.append((x, y))
        
        return positions
    
    def handle_event(self, event):
        """
        Handle pygame events.
        
        Args:
            event: The pygame event to handle
            
        Returns:
            The next screen to display, or None to stay on the current screen
        """
        if event.type == pygame.MOUSEBUTTONDOWN:
            # Check if a crow was clicked
            mouse_pos = pygame.mouse.get_pos()
            for i, position in enumerate(self.crow_positions):
                # Create a rect around the crow for hit detection
                crow_rect = pygame.Rect(
                    position[0] - 100,  # Adjust based on crow size
                    position[1] - 150,
                    200,  # Adjust based on crow size
                    300
                )
                
                if crow_rect.collidepoint(mouse_pos):
                    self.selected_crow_index = i
                    break
            
            # Check if the select button was clicked
            mouse_pressed = pygame.mouse.get_pressed()
            if self.select_button.update(mouse_pos, mouse_pressed) and self.selected_crow_index is not None:
                # Set the selected Alpha Crow in the game state
                self.game_state.select_alpha_crow(self.alpha_crows[self.selected_crow_index])
                
                # Return the drafting screen
                return DraftingScreen(self.screen, self.game_state)
        
        return None
    
    def update(self):
        """
        Update the screen state.
        """
        # Update the select button
        mouse_pos = pygame.mouse.get_pos()
        mouse_pressed = pygame.mouse.get_pressed()
        self.select_button.update(mouse_pos, mouse_pressed)
    
    def draw(self):
        """
        Draw the screen.
        """
        # Clear the screen with the background color
        self.screen.fill(self.bg_color)
        
        # Draw the title
        self.draw_text(
            "Choose your Alpha Crow",
            self.title_font,
            self.WHITE,
            self.width // 2,
            50,
            align="center"
        )
        
        # Draw the Alpha Crows
        for i, (crow, position) in enumerate(zip(self.alpha_crows, self.crow_positions)):
            selected = (i == self.selected_crow_index)
            crow.draw(self.screen, position, selected=selected)
            
            # Draw crow name below
            self.draw_text(
                crow.name,
                self.text_font,
                self.WHITE,
                position[0],
                position[1] + 170,  # Adjust based on crow size
                align="center"
            )
        
        # Draw the description box
        pygame.draw.rect(self.screen, self.DARK_GRAY, self.description_box_rect, border_radius=10)
        pygame.draw.rect(self.screen, self.LIGHT_GRAY, self.description_box_rect, 2, border_radius=10)
        
        # Draw the description if a crow is selected
        if self.selected_crow_index is not None:
            crow = self.alpha_crows[self.selected_crow_index]
            
            # Draw the description title
            self.draw_text(
                f"{crow.name} - {crow.ability}",
                self.subtitle_font,
                self.WHITE,
                self.description_box_rect.centerx,
                self.description_box_rect.top + 20,
                align="center"
            )
            
            # Draw the description text
            # Wrap the text to fit in the box
            words = crow.description.split()
            lines = []
            current_line = []
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                text_width, _ = self.text_font.size(test_line)
                
                if text_width < self.description_box_rect.width - 40:
                    current_line.append(word)
                else:
                    lines.append(' '.join(current_line))
                    current_line = [word]
            
            if current_line:
                lines.append(' '.join(current_line))
            
            # Draw each line
            for i, line in enumerate(lines):
                self.draw_text(
                    line,
                    self.text_font,
                    self.WHITE,
                    self.description_box_rect.left + 20,
                    self.description_box_rect.top + 60 + i * 30,
                    align="left"
                )
        else:
            # Draw a prompt to select a crow
            self.draw_text(
                "Select an Alpha Crow to see its description",
                self.text_font,
                self.WHITE,
                self.description_box_rect.centerx,
                self.description_box_rect.centery,
                align="center"
            )
        
        # Draw the select button
        self.select_button.draw(self.screen) 