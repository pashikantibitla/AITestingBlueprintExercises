"""
Kimi Model Configurations

Available models from Moonshot AI:
- moonshot-v1-8k: Context window 8k tokens
- moonshot-v1-32k: Context window 32k tokens
- moonshot-v1-128k: Context window 128k tokens
- kimi-k2.5: Latest Kimi K2.5 model with enhanced reasoning
"""

from typing import Dict, List

# Model definitions with metadata
KIMI_MODELS: Dict[str, Dict] = {
    "moonshot-v1-8k": {
        "name": "moonshot-v1-8k",
        "context_window": 8192,
        "description": "Standard model with 8k context window",
    },
    "moonshot-v1-32k": {
        "name": "moonshot-v1-32k",
        "context_window": 32768,
        "description": "Extended context model with 32k tokens",
    },
    "moonshot-v1-128k": {
        "name": "moonshot-v1-128k",
        "context_window": 131072,
        "description": "Large context model with 128k tokens",
    },
    "kimi-k2.5": {
        "name": "kimi-k2.5",
        "context_window": 256000,
        "description": "Latest Kimi K2.5 model with enhanced reasoning capabilities",
    },
}

# Default model
DEFAULT_MODEL = "moonshot-v1-8k"

# List of available model names
def get_available_models() -> List[str]:
    """Returns a list of available model names."""
    return list(KIMI_MODELS.keys())

def get_model_info(model_name: str) -> Dict:
    """Returns information about a specific model."""
    return KIMI_MODELS.get(model_name, {})
