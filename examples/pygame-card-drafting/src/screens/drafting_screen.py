import pygame
import random
from src.screens.base_screen import BaseScreen
from src.models.card import create_team_cards, create_environment_card
from src.ui.button import Button

class DraftingScreen(BaseScreen):
    """
    Screen for drafting cards to build your team.
    """
    
    def __init__(self, screen, game_state):
        """
        Initialize the drafting screen.
        
        Args:
            screen: The pygame surface to draw on
            game_state: The current game state
        """
        super().__init__(screen, game_state)
        
        # Background color
        self.bg_color = (30, 40, 50)
        
        # Available cards to draft
        self.available_cards = create_team_cards()
        random.shuffle(self.available_cards)
        
        # Number of cards to show at once
        self.cards_to_show = min(3, len(self.available_cards))
        
        # Currently selected card index
        self.selected_card_index = None
        
        # Card being dragged
        self.dragging_card = None
        self.drag_offset = (0, 0)
        
        # Track if the dragged card is from team positions
        self.dragging_from_team = False
        self.dragging_from_position = None
        
        # Visual feedback for valid drop targets
        self.hover_position = None
        
        # Season emojis
        self.season_emojis = {
            "Spring": "🌱",
            "Summer": "☀️",
            "Fall": "🍂",
            "Winter": "❄️"
        }
        
        # Team positions (3 front, 2 back)
        self.team_positions = []
        self._setup_team_positions()
        
        # Card positions for available cards
        self.card_positions = self._calculate_card_positions()
        
        # Description box
        self.description_box_rect = pygame.Rect(
            self.width // 4,
            self.height - 180,
            self.width // 2,
            120
        )
        
        # Event phase variables
        self.event_result_message = ""
        self.event_result_timer = 0
        self.event_result_duration = 3000  # 3 seconds to display result
        
        # Continue button for event phase
        self.continue_button = Button(
            self.width // 2,
            self.height - 100,
            200,
            50,
            "Continue",
            self.end_event_phase
        )
        
        # HP display
        self.hp_rect = pygame.Rect(20, self.height - 200, 150, 80)
        
        # Heart shapes for HP display
        self.heart_points = [
            (0, -4),   # Top point
            (4, -8),   # Top right curve
            (8, -4),   # Right point
            (4, 4),    # Bottom right curve
            (0, 8),    # Bottom point
            (-4, 4),   # Bottom left curve
            (-8, -4),  # Left point
            (-4, -8),  # Top left curve
        ]
        
        # Scale heart points
        heart_scale = 3
        self.heart_points = [(x * heart_scale, y * heart_scale) for x, y in self.heart_points]
    
    def _setup_team_positions(self):
        """
        Set up the team positions for cards.
        """
        # Calculate the center area for team positions
        center_x = self.width // 2
        center_y = self.height // 2 + 50  # Move up to avoid overlap with description box
        
        # Card dimensions
        card_width, card_height = 120, 180
        
        # Front row (3 positions)
        front_y = center_y + 60
        front_spacing = 180  # Increase spacing to avoid overlap
        for i in range(3):
            x = center_x + (i - 1) * front_spacing
            self.team_positions.append({
                "rect": pygame.Rect(x - card_width // 2, front_y - card_height // 2, card_width, card_height),
                "card": self.game_state.team_positions["front"][i],
                "row": "front",
                "index": i
            })
        
        # Back row (2 positions)
        back_y = center_y - 80  # Move up more to create clear separation
        back_spacing = 240  # Increase spacing to avoid overlap
        for i in range(2):
            x = center_x + (i - 0.5) * back_spacing
            self.team_positions.append({
                "rect": pygame.Rect(x - card_width // 2, back_y - card_height // 2, card_width, card_height),
                "card": self.game_state.team_positions["back"][i],
                "row": "back",
                "index": i
            })
    
    def _calculate_card_positions(self):
        """
        Calculate the positions for displaying the available cards.
        
        Returns:
            A list of (x, y) positions for each card
        """
        positions = []
        
        # Calculate horizontal spacing
        total_width = self.width * 0.8  # Use 80% of the screen width
        spacing = total_width / (self.cards_to_show + 1)
        
        # Y position (higher in the top portion)
        y = self.height // 6
        
        # Calculate positions
        for i in range(self.cards_to_show):
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
        # If in event phase, only handle continue button
        if self.game_state.event_phase_active:
            if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                mouse_pos = pygame.mouse.get_pos()
                if self.continue_button.is_clicked(mouse_pos):
                    self.continue_button.on_click()
            return None
            
        if event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:  # Left mouse button
            # Check if a card was clicked
            mouse_pos = pygame.mouse.get_pos()
            
            # First check team positions for cards
            for i, position in enumerate(self.team_positions):
                if position["card"] and position["rect"].collidepoint(mouse_pos):
                    self.dragging_card = position["card"]
                    self.dragging_from_team = True
                    self.dragging_from_position = position
                    
                    # Calculate offset for smooth dragging
                    self.drag_offset = (
                        position["rect"].left - mouse_pos[0],
                        position["rect"].top - mouse_pos[1]
                    )
                    
                    # Show card description
                    self.selected_card_index = None  # Clear available card selection
                    return None
            
            # If no team card was clicked, check available cards
            for i, position in enumerate(self.card_positions):
                if i < len(self.available_cards):
                    # Create a rect around the card for hit detection
                    card_width, card_height = 120, 180
                    card_rect = pygame.Rect(
                        position[0] - card_width // 2,
                        position[1] - card_height // 2,
                        card_width,
                        card_height
                    )
                    
                    if card_rect.collidepoint(mouse_pos):
                        self.selected_card_index = i
                        self.dragging_card = self.available_cards[i]
                        self.dragging_from_team = False
                        self.dragging_from_position = None
                        
                        # Calculate offset for smooth dragging
                        self.drag_offset = (
                            position[0] - card_width // 2 - mouse_pos[0],
                            position[1] - card_height // 2 - mouse_pos[1]
                        )
                        break
        
        elif event.type == pygame.MOUSEBUTTONUP and event.button == 1:  # Left mouse button released
            if self.dragging_card:
                mouse_pos = pygame.mouse.get_pos()
                
                # Check if the card was dropped on a team position
                dropped = False
                for position in self.team_positions:
                    if position["rect"].collidepoint(mouse_pos):
                        # Handle team card movement (swap cards between positions)
                        if self.dragging_from_team:
                            # Get the card at the target position (might be None)
                            target_card = position["card"]
                            
                            # Update the target position with the dragged card
                            position["card"] = self.dragging_card
                            self.game_state.team_positions[position["row"]][position["index"]] = self.dragging_card
                            
                            # Update the source position with the target card (might be None)
                            if self.dragging_from_position:
                                self.dragging_from_position["card"] = target_card
                                self.game_state.team_positions[self.dragging_from_position["row"]][self.dragging_from_position["index"]] = target_card
                            
                            dropped = True
                        # Handle drafting a new card from available cards
                        else:
                            # If there's already a card in this position, swap it back to available
                            if position["card"]:
                                self.available_cards.append(position["card"])
                            
                            # Place the dragged card in this position
                            position["card"] = self.dragging_card
                            
                            # Update the game state
                            self.game_state.team_positions[position["row"]][position["index"]] = self.dragging_card
                            
                            # Remove the card from available cards
                            if self.selected_card_index is not None:
                                self.available_cards.pop(self.selected_card_index)
                            
                            # Add to team cards list
                            self.game_state.add_team_card(self.dragging_card, row=position["row"], index=position["index"])
                            
                            # Update game state
                            self.game_state.draws_remaining -= 1
                            
                            # Refresh available cards after each draw
                            self.refresh_available_cards()
                            
                            # Start event phase if no draws remaining
                            if self.game_state.draws_remaining <= 0:
                                self.start_event_phase()
                            
                            dropped = True
                        break
                
                # If dragging from team and not dropped on a valid position, return to original position
                if self.dragging_from_team and not dropped and self.dragging_from_position:
                    # Card returns to its original position
                    pass
                
                # Reset selection and dragging
                self.selected_card_index = None
                self.dragging_card = None
                self.dragging_from_team = False
                self.dragging_from_position = None
                self.hover_position = None
                
                # Recalculate card positions if needed
                if dropped and not self.dragging_from_team and len(self.available_cards) < self.cards_to_show:
                    self.cards_to_show = max(1, len(self.available_cards))
                    self.card_positions = self._calculate_card_positions()
        
        elif event.type == pygame.MOUSEMOTION:
            # Update hover state for visual feedback
            if self.dragging_card:
                mouse_pos = pygame.mouse.get_pos()
                self.hover_position = None
                
                for position in self.team_positions:
                    if position["rect"].collidepoint(mouse_pos):
                        self.hover_position = position
                        break
        
        return None
    
    def start_event_phase(self):
        """
        Start the event phase with a random environment card.
        """
        # Set event phase active
        self.game_state.event_phase_active = True
        
        # Create a random environment card based on the current season
        self.game_state.current_environment_card = create_environment_card(self.game_state.current_season)
        
        # Compare team stats against environment card
        self.resolve_event()
    
    def resolve_event(self):
        """
        Resolve the event by comparing team stats against the environment card.
        """
        # Calculate total team attack and defense
        team_attack = 0
        team_defense = 0
        
        # Add up stats from all cards in team positions
        for row in self.game_state.team_positions:
            for card in self.game_state.team_positions[row]:
                if card:
                    team_attack += card.attack
                    team_defense += card.defense
        
        # Get environment card stats
        env_card = self.game_state.current_environment_card
        env_attack = env_card.attack
        env_defense = env_card.defense
        
        # Determine outcome
        if team_attack >= env_defense and team_defense >= env_attack:
            # Complete success
            self.event_result_message = "Your team successfully overcame the event!"
        elif team_attack >= env_defense:
            # Partial success - overcame defense but took damage
            self.game_state.player_hp -= 1
            self.event_result_message = "Your team overcame the event but suffered damage!"
        elif team_defense >= env_attack:
            # Partial success - withstood attack but couldn't overcome
            self.game_state.player_hp -= 1
            self.event_result_message = "Your team withstood the attack but couldn't overcome the event!"
        else:
            # Complete failure
            self.game_state.player_hp -= 2
            self.event_result_message = "Your team failed to handle the event and suffered heavy damage!"
        
        # Check for game over
        if self.game_state.player_hp <= 0:
            self.game_state.player_hp = 0
            self.event_result_message += " GAME OVER!"
            # TODO: Transition to game over screen
    
    def end_event_phase(self):
        """
        End the event phase and advance to the next turn.
        """
        # Reset event phase
        self.game_state.event_phase_active = False
        self.game_state.current_environment_card = None
        
        # Advance to next turn
        self.advance_turn()
    
    def refresh_available_cards(self):
        """
        Refresh the available cards to draft.
        """
        # Create new set of cards
        self.available_cards = create_team_cards()
        random.shuffle(self.available_cards)
        self.cards_to_show = min(3, len(self.available_cards))
        self.card_positions = self._calculate_card_positions()
    
    def advance_turn(self):
        """
        Advance to the next turn, updating season if needed.
        """
        # Use the game state to advance the turn
        self.game_state.advance_turn()
        
        # Refresh available cards
        self.refresh_available_cards()
    
    def update(self):
        """
        Update the screen state.
        """
        # Update event result timer if active
        if self.event_result_timer > 0:
            self.event_result_timer -= pygame.time.get_ticks()
            if self.event_result_timer <= 0:
                self.event_result_timer = 0
    
    def draw(self):
        """
        Draw the screen.
        """
        # Clear the screen with the background color
        self.screen.fill(self.bg_color)
        
        # Draw the Alpha Crow info in lower left corner
        if self.game_state.alpha_crow:
            alpha_crow = self.game_state.alpha_crow
            # Draw Alpha Crow background
            alpha_crow_rect = pygame.Rect(20, self.height - 100, 200, 80)
            pygame.draw.rect(self.screen, (40, 50, 60), alpha_crow_rect, border_radius=10)
            pygame.draw.rect(self.screen, (60, 70, 80), alpha_crow_rect, 2, border_radius=10)
            
            # Draw Alpha Crow avatar
            avatar_rect = pygame.Rect(30, self.height - 90, 60, 60)
            pygame.draw.rect(self.screen, (80, 90, 100), avatar_rect, border_radius=5)
            pygame.draw.rect(self.screen, self.WHITE, avatar_rect, 2, border_radius=5)
            
            # Draw a simple crow symbol using lines
            crow_color = self.WHITE
            center_x, center_y = avatar_rect.centerx, avatar_rect.centery
            # Body
            pygame.draw.ellipse(self.screen, crow_color, (center_x - 15, center_y - 10, 30, 20), 2)
            # Head
            pygame.draw.circle(self.screen, crow_color, (center_x + 12, center_y - 8), 8, 2)
            # Beak
            pygame.draw.polygon(self.screen, crow_color, [
                (center_x + 18, center_y - 10),
                (center_x + 25, center_y - 8),
                (center_x + 18, center_y - 6)
            ])
            
            # Draw Alpha Crow name
            self.draw_text(
                f"Alpha Crow:",
                self.small_font,
                self.LIGHT_GRAY,
                avatar_rect.right + 20,
                self.height - 85,
                align="left"
            )
            self.draw_text(
                alpha_crow.name,
                self.text_font,
                self.WHITE,
                avatar_rect.right + 20,
                self.height - 60,
                align="left"
            )
        
        # Draw player HP in lower left corner
        self.draw_player_hp()
                                
        # Draw turn and season info
        season_emoji = self.season_emojis.get(self.game_state.current_season, "")
        self.draw_text(
            f"Turn #{self.game_state.current_turn} - {season_emoji} {self.game_state.current_season}",
            self.subtitle_font,
            self.WHITE,
            self.width - 20,
            20,
            align="right"
        )
        
        # Draw draws remaining
        self.draw_text(
            f"Draws Remaining: {self.game_state.draws_remaining}",
            self.text_font,
            self.WHITE,
            self.width - 20,
            60,
            align="right"
        )
        
        # If in event phase, draw the event screen
        if self.game_state.event_phase_active:
            self.draw_event_phase()
            return
        
        # Draw team position area background
        team_area_rect = pygame.Rect(
            self.width // 6,
            self.height // 3,
            self.width * 2 // 3,
            self.height // 2
        )
        pygame.draw.rect(self.screen, (40, 50, 60), team_area_rect, border_radius=15)
        pygame.draw.rect(self.screen, (60, 70, 80), team_area_rect, 2, border_radius=15)
        
        # Draw team positions
        for position in self.team_positions:
            # Determine color based on hover state
            outline_color = (150, 200, 150) if position == self.hover_position else (100, 100, 100)
            outline_width = 3 if position == self.hover_position else 2
            
            # Draw position outline
            pygame.draw.rect(
                self.screen, 
                outline_color, 
                position["rect"], 
                outline_width, 
                border_radius=10
            )
            
            # Draw position label
            row_text = "Front" if position["row"] == "front" else "Back"
            self.draw_text(
                row_text,
                self.small_font,
                self.LIGHT_GRAY,
                position["rect"].centerx,
                position["rect"].top - 20,
                align="center"
            )
            
            # Draw card in position if there is one and it's not being dragged
            if position["card"] and (not self.dragging_from_team or position != self.dragging_from_position):
                position["card"].draw(
                    self.screen, 
                    (position["rect"].left, position["rect"].top)
                )
        
        # Draw the available cards
        for i, position in enumerate(self.card_positions):
            if i < len(self.available_cards) and self.available_cards[i] != self.dragging_card:
                card = self.available_cards[i]
                selected = (i == self.selected_card_index and not self.dragging_card)
                
                # Calculate the top-left position for the card
                card_width, card_height = 120, 180
                card_pos = (position[0] - card_width // 2, position[1] - card_height // 2)
                
                # Draw the card
                card.draw(self.screen, card_pos, selected=selected)
        
        # Draw the description box
        pygame.draw.rect(self.screen, self.DARK_GRAY, self.description_box_rect, border_radius=10)
        pygame.draw.rect(self.screen, self.LIGHT_GRAY, self.description_box_rect, 2, border_radius=10)
        
        # Draw the description if a card is selected or being dragged
        if self.dragging_card:
            card = self.dragging_card
            self._draw_card_description(card)
        elif self.selected_card_index is not None and self.selected_card_index < len(self.available_cards):
            card = self.available_cards[self.selected_card_index]
            self._draw_card_description(card)
        else:
            # Draw a prompt to select a card
            self.draw_text(
                "Select a card to see its description",
                self.text_font,
                self.WHITE,
                self.description_box_rect.centerx,
                self.description_box_rect.centery,
                align="center"
            )
        
        # Draw instructions
        self.draw_text(
            "Drag cards to team positions or rearrange your team",
            self.small_font,
            self.LIGHT_GRAY,
            self.width // 2,
            self.height - 40,
            align="center"
        )
        
        # Draw the card being dragged (on top of everything)
        if self.dragging_card:
            mouse_pos = pygame.mouse.get_pos()
            drag_pos = (
                mouse_pos[0] + self.drag_offset[0],
                mouse_pos[1] + self.drag_offset[1]
            )
            self.dragging_card.draw(self.screen, drag_pos)
    
    def draw_player_hp(self):
        """
        Draw the player's HP in the lower left corner.
        """
        # Draw HP background
        pygame.draw.rect(self.screen, (40, 50, 60), self.hp_rect, border_radius=10)
        pygame.draw.rect(self.screen, (60, 70, 80), self.hp_rect, 2, border_radius=10)
        
        # Draw HP label
        self.draw_text(
            "Health:",
            self.small_font,
            self.LIGHT_GRAY,
            self.hp_rect.left + 20,
            self.hp_rect.top + 20,
            align="left"
        )
        
        # Draw hearts for HP
        heart_spacing = 40
        for i in range(3):  # Max HP is 3
            heart_center = (self.hp_rect.left + 40 + (i * heart_spacing), self.hp_rect.top + 50)
            
            # Draw filled or empty heart based on current HP
            if i < self.game_state.player_hp:
                # Filled heart (red)
                self.draw_heart(heart_center, (255, 50, 50), filled=True)
            else:
                # Empty heart (outline)
                self.draw_heart(heart_center, (150, 150, 150), filled=False)
    
    def draw_heart(self, center, color, filled=True):
        """
        Draw a heart shape at the specified center position.
        
        Args:
            center: (x, y) center position
            color: RGB color tuple
            filled: Whether to fill the heart or just draw the outline
        """
        # Transform heart points to center position
        transformed_points = [(center[0] + x, center[1] + y) for x, y in self.heart_points]
        
        # Draw the heart
        if filled:
            pygame.draw.polygon(self.screen, color, transformed_points)
        else:
            pygame.draw.polygon(self.screen, color, transformed_points, 2)
    
    def draw_event_phase(self):
        """
        Draw the event phase screen.
        """
        # Draw semi-transparent overlay
        overlay = pygame.Surface((self.width, self.height), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 180))  # Semi-transparent black
        self.screen.blit(overlay, (0, 0))
        
        # Draw event title
        self.draw_text(
            "Environmental Event!",
            self.title_font,
            self.WHITE,
            self.width // 2,
            100,
            align="center"
        )
        
        # Draw environment card
        env_card = self.game_state.current_environment_card
        if env_card:
            card_width, card_height = 120, 180
            card_pos = (self.width // 2 - card_width // 2, 150)
            env_card.draw(self.screen, card_pos, scale=1.5)
            
            # Draw event description
            self.draw_text(
                env_card.description,
                self.subtitle_font,
                self.WHITE,
                self.width // 2,
                350,
                align="center"
            )
        
        # Draw team stats vs environment stats
        team_attack, team_defense = self.calculate_team_stats()
        
        # Draw team stats
        team_stats_rect = pygame.Rect(self.width // 4 - 100, 400, 200, 100)
        pygame.draw.rect(self.screen, (40, 60, 80), team_stats_rect, border_radius=10)
        pygame.draw.rect(self.screen, (60, 80, 100), team_stats_rect, 2, border_radius=10)
        
        self.draw_text(
            "Your Team",
            self.subtitle_font,
            self.WHITE,
            team_stats_rect.centerx,
            team_stats_rect.top + 20,
            align="center"
        )
        
        self.draw_text(
            f"Attack: {team_attack}",
            self.text_font,
            (200, 100, 100),
            team_stats_rect.centerx,
            team_stats_rect.top + 50,
            align="center"
        )
        
        self.draw_text(
            f"Defense: {team_defense}",
            self.text_font,
            (100, 100, 200),
            team_stats_rect.centerx,
            team_stats_rect.top + 80,
            align="center"
        )
        
        # Draw environment stats
        env_stats_rect = pygame.Rect(self.width * 3 // 4 - 100, 400, 200, 100)
        pygame.draw.rect(self.screen, (60, 40, 40), env_stats_rect, border_radius=10)
        pygame.draw.rect(self.screen, (80, 60, 60), env_stats_rect, 2, border_radius=10)
        
        self.draw_text(
            env_card.name,
            self.subtitle_font,
            self.WHITE,
            env_stats_rect.centerx,
            env_stats_rect.top + 20,
            align="center"
        )
        
        self.draw_text(
            f"Attack: {env_card.attack}",
            self.text_font,
            (200, 100, 100),
            env_stats_rect.centerx,
            env_stats_rect.top + 50,
            align="center"
        )
        
        self.draw_text(
            f"Defense: {env_card.defense}",
            self.text_font,
            (100, 100, 200),
            env_stats_rect.centerx,
            env_stats_rect.top + 80,
            align="center"
        )
        
        # Draw comparison arrows
        arrow_y = 440
        # Attack comparison (team attack vs environment defense)
        attack_result = "✓" if team_attack >= env_card.defense else "✗"
        attack_color = (100, 200, 100) if team_attack >= env_card.defense else (200, 100, 100)
        
        self.draw_text(
            f"{team_attack} → {attack_result} → {env_card.defense}",
            self.subtitle_font,
            attack_color,
            self.width // 2,
            arrow_y,
            align="center"
        )
        
        # Defense comparison (team defense vs environment attack)
        defense_result = "✓" if team_defense >= env_card.attack else "✗"
        defense_color = (100, 200, 100) if team_defense >= env_card.attack else (200, 100, 100)
        
        self.draw_text(
            f"{team_defense} → {defense_result} → {env_card.attack}",
            self.subtitle_font,
            defense_color,
            self.width // 2,
            arrow_y + 30,
            align="center"
        )
        
        # Draw result message
        self.draw_text(
            self.event_result_message,
            self.subtitle_font,
            self.WHITE,
            self.width // 2,
            520,
            align="center"
        )
        
        # Draw continue button
        self.continue_button.draw(self.screen)
    
    def calculate_team_stats(self):
        """
        Calculate the total attack and defense stats of the team.
        
        Returns:
            Tuple of (attack, defense)
        """
        team_attack = 0
        team_defense = 0
        
        # Add up stats from all cards in team positions
        for row in self.game_state.team_positions:
            for card in self.game_state.team_positions[row]:
                if card:
                    team_attack += card.attack
                    team_defense += card.defense
        
        return team_attack, team_defense
    
    def _draw_card_description(self, card):
        """
        Draw the description for a card.
        
        Args:
            card: The card to draw the description for
        """
        # Draw the card name and stats
        self.draw_text(
            f"{card.name} - Cost: {card.cost}, Attack: {card.attack}, Defense: {card.defense}",
            self.subtitle_font,
            self.WHITE,
            self.description_box_rect.centerx,
            self.description_box_rect.top + 20,
            align="center"
        )
        
        # Draw the card description
        self.draw_text(
            card.description,
            self.text_font,
            self.WHITE,
            self.description_box_rect.centerx,
            self.description_box_rect.centery,
            align="center"
        )
        
        # Draw the card rarity
        self.draw_text(
            f"Rarity: {card.rarity.capitalize()}",
            self.text_font,
            self.WHITE,
            self.description_box_rect.centerx,
            self.description_box_rect.bottom - 20,
            align="center"
        ) 