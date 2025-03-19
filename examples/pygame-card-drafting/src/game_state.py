class GameState:
    """
    Manages the overall state of the game, including player selections and progress.
    """
    
    def __init__(self):
        # Player's selected alpha crow (None until selected)
        self.alpha_crow = None
        
        # Player's team of cards
        self.team_cards = []
        
        # Team positions (front row and back row)
        self.team_positions = {
            "front": [None, None, None],  # 3 positions in front row
            "back": [None, None]          # 2 positions in back row
        }
        
        # Available cards to draft
        self.available_cards = []
        
        # Game progression
        self.current_turn = 1
        self.current_season = "Spring"  # Spring, Summer, Fall, Winter
        self.draws_remaining = 2
        self.turns_per_season = 3
        
        # Current game stage
        self.stage = "alpha_selection"  # Possible values: alpha_selection, drafting, battle, etc.
        
        # Player health points
        self.player_hp = 3
        
        # Current environment card (for events phase)
        self.current_environment_card = None
        
        # Event phase active flag
        self.event_phase_active = False
        
    def select_alpha_crow(self, crow):
        """
        Set the player's chosen Alpha Crow
        """
        self.alpha_crow = crow
        self.stage = "drafting"  # Move to the next stage
        
    def add_team_card(self, card, position=None, row=None, index=None):
        """
        Add a card to the player's team
        
        Args:
            card: The card to add
            position: Optional position descriptor (front/back)
            row: Optional row descriptor (front/back)
            index: Optional index within the row
        """
        self.team_cards.append(card)
        
        # If position information is provided, place the card in that position
        if row and index is not None:
            if row in self.team_positions and 0 <= index < len(self.team_positions[row]):
                self.team_positions[row][index] = card
        
    def remove_team_card(self, card):
        """
        Remove a card from the player's team
        """
        if card in self.team_cards:
            self.team_cards.remove(card)
            
            # Also remove from team positions if present
            for row in self.team_positions:
                if card in self.team_positions[row]:
                    index = self.team_positions[row].index(card)
                    self.team_positions[row][index] = None
    
    def advance_turn(self):
        """
        Advance to the next turn, updating season if needed
        """
        self.current_turn += 1
        self.draws_remaining = 2
        
        # Check if we need to advance the season
        if (self.current_turn - 1) % self.turns_per_season == 0:
            seasons = ["Spring", "Summer", "Fall", "Winter"]
            current_index = seasons.index(self.current_season)
            next_index = (current_index + 1) % len(seasons)
            self.current_season = seasons[next_index] 