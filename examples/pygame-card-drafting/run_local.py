import sys
import subprocess

def run_game():
    """Run the game locally"""
    try:
        # Run the game
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\nGame stopped.")
    except Exception as e:
        print(f"Error running game: {e}")

if __name__ == "__main__":
    # Run the game
    run_game() 