import os
import sys
import subprocess
import shutil
import zipfile

def build_web():
    """Build the web version of the game for deployment"""
    print("Building web version for deployment...")
    
    # Create build directory if it doesn't exist
    if not os.path.exists("build"):
        os.makedirs("build")
    
    # Run pygbag in build mode
    try:
        subprocess.run([
            "python3", 
            "-m", 
            "pygbag", 
            "--build", 
            "--ume_block=0",
            "main_web.py"
        ])
        
        print("\nBuild completed successfully!")
        print("The web build can be found in the 'build/web' directory.")
        print("You can deploy this to platforms like itch.io.")
        
    except Exception as e:
        print(f"Error building web version: {e}")
        return False
    
    return True

def create_zip():
    """Create a zip file of the web build for easy upload"""
    if not os.path.exists("build/web"):
        print("Web build not found. Run build_web() first.")
        return False
    
    print("Creating zip file of web build...")
    
    try:
        # Create zip file
        with zipfile.ZipFile("build/crows_web.zip", "w") as zipf:
            for root, dirs, files in os.walk("build/web"):
                for file in files:
                    file_path = os.path.join(root, file)
                    zipf.write(
                        file_path, 
                        os.path.relpath(file_path, "build")
                    )
        
        print(f"Zip file created at build/crows_web.zip")
        return True
    
    except Exception as e:
        print(f"Error creating zip file: {e}")
        return False

if __name__ == "__main__":
    # Check if pygbag is installed
    try:
        import pygbag
    except ImportError:
        print("pygbag is not installed. Installing now...")
        subprocess.run(["python3", "-m", "pip", "install", "pygbag"])
    
    # Build web version
    if build_web():
        # Create zip file
        create_zip() 