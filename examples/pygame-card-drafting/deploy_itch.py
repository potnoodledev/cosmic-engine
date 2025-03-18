#!/usr/bin/env python3
import os
import sys
import subprocess
import platform
import argparse
import shutil  # Move shutil import to the top
from pathlib import Path
import build_web  # Import the existing build script

def check_butler():
    """Check if butler is installed and install if needed"""
    try:
        # Try to run butler version to check if it's installed
        result = subprocess.run(
            ["butler", "version"], 
            capture_output=True, 
            text=True
        )
        print(f"Butler is installed: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("Butler not found. Installing...")
        return install_butler()

def install_butler():
    """Install butler based on the operating system"""
    system = platform.system().lower()
    
    # Create directory for butler if it doesn't exist
    butler_dir = Path.home() / ".local" / "bin"
    os.makedirs(butler_dir, exist_ok=True)
    
    # Add butler directory to PATH if not already there
    if str(butler_dir) not in os.environ["PATH"]:
        os.environ["PATH"] += os.pathsep + str(butler_dir)
    
    try:
        if system == "darwin":  # macOS
            url = "https://broth.itch.ovh/butler/darwin-amd64/LATEST/archive/default"
            download_path = "/tmp/butler.zip"
            
            # Download butler
            subprocess.run(["curl", "-L", url, "-o", download_path], check=True)
            
            # Extract butler
            extract_dir = "/tmp/butler"
            os.makedirs(extract_dir, exist_ok=True)
            subprocess.run(["unzip", "-o", download_path, "-d", extract_dir], check=True)  # Added -o flag to overwrite
            
            # Move butler to PATH
            butler_path = butler_dir / "butler"
            shutil.copy(os.path.join(extract_dir, "butler"), butler_path)
            os.chmod(butler_path, 0o755)
            
        elif system == "linux":
            url = "https://broth.itch.ovh/butler/linux-amd64/LATEST/archive/default"
            download_path = "/tmp/butler.zip"
            
            # Download butler
            subprocess.run(["curl", "-L", url, "-o", download_path], check=True)
            
            # Extract butler
            extract_dir = "/tmp/butler"
            os.makedirs(extract_dir, exist_ok=True)
            subprocess.run(["unzip", "-o", download_path, "-d", extract_dir], check=True)  # Added -o flag to overwrite
            
            # Move butler to PATH
            butler_path = butler_dir / "butler"
            shutil.copy(os.path.join(extract_dir, "butler"), butler_path)
            os.chmod(butler_path, 0o755)
            
        elif system == "windows":
            url = "https://broth.itch.ovh/butler/windows-amd64/LATEST/archive/default"
            download_path = os.path.join(os.environ["TEMP"], "butler.zip")
            
            # Download butler
            subprocess.run(["curl", "-L", url, "-o", download_path], check=True)
            
            # Extract butler
            extract_dir = os.path.join(os.environ["TEMP"], "butler")
            os.makedirs(extract_dir, exist_ok=True)
            import zipfile
            with zipfile.ZipFile(download_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
            
            # Move butler to PATH
            butler_path = os.path.join(os.environ["USERPROFILE"], "butler.exe")
            shutil.copy(os.path.join(extract_dir, "butler.exe"), butler_path)
            
            # Add to PATH
            os.environ["PATH"] += os.pathsep + os.path.dirname(butler_path)
        
        print("Butler installed successfully!")
        return True
    
    except Exception as e:
        print(f"Error installing butler: {e}")
        print("Please install butler manually: https://itch.io/docs/butler/installing.html")
        return False

def login_to_itch():
    """Login to itch.io using butler"""
    try:
        subprocess.run(["butler", "login"], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error logging in to itch.io: {e}")
        return False

def deploy_to_itch(username, game_name, channel="web"):
    """Deploy the game to itch.io"""
    # Build the web version first
    if not build_web.build_web():
        print("Failed to build web version. Aborting deployment.")
        return False
    
    # Create the target string for butler push
    target = f"{username}/{game_name}:{channel}"
    build_path = "build/web"
    
    print(f"Deploying to itch.io as {target}...")
    
    try:
        subprocess.run([
            "butler", "push", 
            build_path, 
            target,
            "--userversion", get_version()
        ], check=True)
        
        print(f"Successfully deployed to https://{username}.itch.io/{game_name}")
        return True
    
    except subprocess.CalledProcessError as e:
        print(f"Error deploying to itch.io: {e}")
        return False

def get_version():
    """Get a version string for the deployment"""
    # You can customize this to use a version from your project
    # For now, we'll use a timestamp
    from datetime import datetime
    return datetime.now().strftime("%Y.%m.%d.%H%M")

def main():
    parser = argparse.ArgumentParser(description="Deploy game to itch.io")
    parser.add_argument("--username", required=True, help="Your itch.io username")
    parser.add_argument("--game", required=True, help="The game name on itch.io (URL slug)")
    parser.add_argument("--channel", default="web", help="The channel to deploy to (default: web)")
    
    args = parser.parse_args()
    
    # Check if butler is installed
    if not check_butler():
        return
    
    # Login to itch.io
    if not login_to_itch():
        return
    
    # Deploy to itch.io
    deploy_to_itch(args.username, args.game, args.channel)

if __name__ == "__main__":
    main() 