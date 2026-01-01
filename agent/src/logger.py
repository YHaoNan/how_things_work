import logging
import sys
import os

def setup_logger(log_file_path="agent.log", verbose=False):
    """
    Sets up the global logger configuration.
    
    Args:
        log_file_path (str): Path to the log file.
        verbose (bool): If True, set logging level to DEBUG, else INFO.
    """
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # File handler
    try:
        file_handler = logging.FileHandler(log_file_path, encoding='utf-8')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    except Exception as e:
        print(f"Failed to setup file logging: {e}")

    # Console handler (optional, but good for debugging if verbose)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    if verbose:
        console_handler.setLevel(logging.DEBUG)
    else:
        # If not verbose, maybe we only want errors or critical info on console?
        # Or maybe we rely on the application's print statements for normal output
        # and use logger for background stuff.
        # The bootstrap call says verbose=False, and "we want to control console output manually".
        # So maybe we shouldn't add console handler if not verbose, or set it to WARNING.
        console_handler.setLevel(logging.WARNING)
    
    logger.addHandler(console_handler)
    
    return logger
