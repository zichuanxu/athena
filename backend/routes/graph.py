import requests
from fastapi import APIRouter, HTTPException, Request
from services.graph_service import get_graph_data, get_graph_label_list, get_graph_entity_exists
from thefuzz import fuzz
import json
import os

graph_router = APIRouter()
MAX_SIMILAR_ENTITY_COUNT = 10
MIN_SIMILARITY = 85

# Load locales
LOCALES_DIR = os.path.join(os.path.dirname(__file__), "../locales")
# Load translations
translations = {}

for lang in ["en", "ja"]:
    path = os.path.join(LOCALES_DIR, lang, "graph.json")
    with open(path, encoding="utf-8") as f:
        translations[lang] = json.load(f)

@graph_router.get("/api/graph-query")
async def query_graph(request: Request, label: str, max_depth: int = 1, max_nodes: int = 1000):
    try:
        # Determine language
        language = request.headers.get("accept-language", "en")
        i18n = translations[language]

        # check if exist
        exists = get_graph_entity_exists(label)
        if not exists:
            list = get_graph_label_list()
            message = i18n["entity_not_exist"]
            similar_entities = []
            for item in list:
                if fuzz.partial_ratio(label, item) > MIN_SIMILARITY:
                    similar_entities.append(item)
                    if(len(similar_entities) > MAX_SIMILAR_ENTITY_COUNT):
                        break
            if(len(similar_entities) > 0):
                message += " " + i18n["did_you_mean"] + " " + ", ".join(similar_entities)
            return {"exists": False, "data": message}
        else:
            return {"exists": True, "data": get_graph_data(label, max_depth, max_nodes)}
    except requests.exceptions.ConnectionError:
        raise HTTPException(status_code=503, detail="Failed to connect to LightRAG service.")
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="LightRAG service request timed out.")
    except requests.exceptions.HTTPError as e:
        raise HTTPException(
            status_code=e.response.status_code if e.response else 500,
            detail= "LightRAG service returned an error: {e}".format(e=e)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unexpected error: {e}".format(e=e))

