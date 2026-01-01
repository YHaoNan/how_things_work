import os
from typing import List
from langchain_core.tools import tool
from src.config import Config

def _get_safe_path(relative_path: str) -> str:
    """
    Joins the relative path with the project work directory and ensures it's safe.
    """
    base_dir = os.path.abspath(Config.PROJECT_ROOT)
    # Allow user to provide path with or without leading slash
    if relative_path.startswith("/") or relative_path.startswith("\\"):
        relative_path = relative_path[1:]
    
    target_path = os.path.abspath(os.path.join(base_dir, relative_path))
    
    # Simple safety check to ensure we don't traverse out of the work dir
    if not target_path.startswith(base_dir):
        raise ValueError(f"Access denied: Path '{relative_path}' is outside the project work directory.")
        
    return target_path

def _generate_tree(dir_path: str, prefix: str = "") -> str:
    """
    Recursive function to generate a tree structure string.
    """
    output = ""
    try:
        entries = sorted(os.listdir(dir_path))
    except PermissionError:
        return f"{prefix}[Permission Denied]\n"
    except FileNotFoundError:
        return f"{prefix}[Path Not Found]\n"

    entries_count = len(entries)
    for index, entry in enumerate(entries):
        connector = "└── " if index == entries_count - 1 else "├── "
        output += f"{prefix}{connector}{entry}\n"
        
        full_path = os.path.join(dir_path, entry)
        if os.path.isdir(full_path):
            extension = "    " if index == entries_count - 1 else "│   "
            output += _generate_tree(full_path, prefix + extension)
            
    return output

@tool
def list_directory_tree(relative_path: str = ".") -> str:
    """
    Lists the contents of a directory in a tree-like structure.
    
    Args:
        relative_path: The relative path to the directory to list (default is root of work dir).
    """
    try:
        target_path = _get_safe_path(relative_path)
        if not os.path.isdir(target_path):
            return f"Error: '{relative_path}' is not a directory."
        
        tree_str = f"{relative_path}/\n" + _generate_tree(target_path)
        return tree_str
    except Exception as e:
        return f"Error listing directory: {e}"

@tool
def read_file(relative_path: str) -> str:
    """
    Reads the content of a file.
    
    Args:
        relative_path: The relative path to the file to read.
    """
    try:
        target_path = _get_safe_path(relative_path)
        if not os.path.isfile(target_path):
            return f"Error: File '{relative_path}' does not exist."
            
        with open(target_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"

@tool
def write_file(relative_path: str, content: str) -> str:
    """
    Writes content to a file. Overwrites if it exists, creates directories if needed.
    
    Args:
        relative_path: The relative path to the file to write.
        content: The text content to write.
    """
    try:
        target_path = _get_safe_path(relative_path)
        
        # Ensure parent directories exist
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)
            
        return f"Successfully wrote to '{relative_path}'."
    except Exception as e:
        return f"Error writing file: {e}"

@tool
def create_directory(relative_path: str) -> str:
    """
    Creates a new directory (and any necessary parent directories).
    
    Args:
        relative_path: The relative path to the directory to create.
    """
    try:
        target_path = _get_safe_path(relative_path)
        
        if os.path.exists(target_path):
             return f"Directory '{relative_path}' already exists."
        
        os.makedirs(target_path, exist_ok=True)
        return f"Successfully created directory '{relative_path}'."
    except Exception as e:
        return f"Error creating directory: {e}"

# Export all tools from this module
FILE_TOOLS = [
    list_directory_tree,
    read_file,
    write_file,
    create_directory
]
