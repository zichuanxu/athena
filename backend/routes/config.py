import json
from fastapi import APIRouter, HTTPException
from models.schemas import ConfigData
from config.config import CONFIG_PATH, load_config, get_config
config_router = APIRouter()

@config_router.get("/api/config", response_model=ConfigData)
async def get_config_api():
    return get_config()

@config_router.post("/api/config")
async def save_config(config: ConfigData):
    try:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(config.model_dump(), f, ensure_ascii=False, indent=2)
        load_config()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save config: {e}")
