import sys
import subprocess
import os

def run_tests():
    """Run all tests in the project"""
    print("Running tests...")
    
    # Check if pytest is installed
    try:
        import pytest
    except ImportError:
        print("pytest is not installed. Installing now...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pytest"])
    
    # Run tests
    try:
        # Find all test files
        test_files = []
        for root, dirs, files in os.walk("src"):
            for file in files:
                if file.startswith("test_") and file.endswith(".py"):
                    test_files.append(os.path.join(root, file))
        
        if not test_files:
            print("No test files found.")
            return
        
        # Run pytest on all test files
        subprocess.run([sys.executable, "-m", "pytest"] + test_files)
        
    except Exception as e:
        print(f"Error running tests: {e}")

if __name__ == "__main__":
    # Run tests
    run_tests() 