import json
import os
from typing import Optional
from models.schemas import ConfigData

CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.json")
CONFIG_DATA: Optional[ConfigData] = None
DEFAULT_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/mm_enshu"
DEFAULT_LIGHT_RAG_URL = "http://localhost:9621"
DEFAULT_MAX_CONTEXT_TOKENS = 4096

def load_config() -> ConfigData:
    global CONFIG_DATA
    default_config = {
        "lightrag_url": DEFAULT_LIGHT_RAG_URL,
        "database_url": DEFAULT_DB_URL,
        "max_context_tokens": DEFAULT_MAX_CONTEXT_TOKENS
    }
    if not os.path.exists(CONFIG_PATH):
        CONFIG_DATA = ConfigData(**default_config)
        try:
            with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                json.dump(CONFIG_DATA.model_dump(), f, ensure_ascii=False, indent=2)
        except Exception:
            pass
    else:
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            CONFIG_DATA = ConfigData(**data)
        except Exception:
            CONFIG_DATA = ConfigData(**default_config)
    return CONFIG_DATA

def get_config() -> ConfigData:
    global CONFIG_DATA
    if CONFIG_DATA is None:
        load_config()
    return CONFIG_DATA

load_config()
