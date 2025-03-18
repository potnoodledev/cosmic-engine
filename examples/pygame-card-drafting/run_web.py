import os
import sys
import subprocess

def run_pygbag():
    """Run the game with pygbag"""
    try:
        # Run pygbag with the main_web.py file
        subprocess.run([
            "python3", 
            "-m", 
            "pygbag", 
            "--port", 
            "8000", 
            "main_web.py"
        ])
    except KeyboardInterrupt:
        print("\nStopping pygbag server...")
    except Exception as e:
        print(f"Error running pygbag: {e}")

if __name__ == "__main__":
    # Check if pygbag is installed
    try:
        import pygbag
    except ImportError:
        print("pygbag is not installed. Installing now...")
        subprocess.run(["python3", "-m", "pip", "install", "pygbag"])
    
    # Run the game
    run_pygbag() 