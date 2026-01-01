import os

def load_text_file(file_path: str, default_content: str = "") -> str:
    """
    Load text from a file. If the file doesn't exist, create it with default_content.
    
    Args:
        file_path (str): The absolute path to the file.
        default_content (str): The content to write if the file doesn't exist.
        
    Returns:
        str: The content of the file.
    """
    if not os.path.exists(file_path):
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(default_content)
            return default_content
        except Exception as e:
            print(f"Error creating file {file_path}: {e}")
            return default_content
            
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        return default_content
