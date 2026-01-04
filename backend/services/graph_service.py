
import requests
from models.schemas import  ConfigData
from config.config import CONFIG_DATA, DEFAULT_LIGHT_RAG_URL, DEFAULT_DB_URL, DEFAULT_MAX_CONTEXT_TOKENS
from cachetools import cached, TTLCache

# cache for graph list, expired in 1 hour
graph_list_cache = TTLCache(maxsize=2, ttl=3600)

def get_graph_label_list():
    return _fetch_graph_label_list()

@cached(graph_list_cache)
def _fetch_graph_label_list():
    try:
        config = CONFIG_DATA or ConfigData(
            lightrag_url=DEFAULT_LIGHT_RAG_URL,
            database_url=DEFAULT_DB_URL,
            max_context_tokens=DEFAULT_MAX_CONTEXT_TOKENS
        )
        lightrag_url = config.lightrag_url

        response = requests.get(
            f"{lightrag_url}/graph/label/list",
            timeout=30
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.ConnectionError as e:
        raise requests.exceptions.ConnectionError(f"Failed to connect to LightRAG service.: {e}")
    except requests.exceptions.Timeout as e:
        raise requests.exceptions.Timeout(f"LightRAG service request timed out.: {e}")
    except requests.exceptions.HTTPError as e:
        raise e
    except Exception as e:
        raise Exception(f"Unexpected error: {e}")

def get_graph_entity_exists(name: str) -> bool:
    try:
        config = CONFIG_DATA or ConfigData(
            lightrag_url=DEFAULT_LIGHT_RAG_URL,
            database_url=DEFAULT_DB_URL,
            max_context_tokens=DEFAULT_MAX_CONTEXT_TOKENS
        )
        lightrag_url = config.lightrag_url

        params = {"name": name}
        response = requests.get(
            f"{lightrag_url}/graph/entity/exists",
            params=params,
            timeout=30
        )
        response.raise_for_status()

        return response.json()["exists"]

    except requests.exceptions.ConnectionError as e:
        raise requests.exceptions.ConnectionError(f"Failed to connect to LightRAG service.: {e}")
    except requests.exceptions.Timeout as e:
        raise requests.exceptions.Timeout(f"LightRAG service request timed out.: {e}")
    except requests.exceptions.HTTPError as e:
        raise e
    except Exception as e:
        raise Exception(f"Unexpected error: {e}")


def get_graph_data(label: str, max_depth: int, max_nodes: int):
    try:
        config = CONFIG_DATA or ConfigData(
            lightrag_url=DEFAULT_LIGHT_RAG_URL,
            database_url=DEFAULT_DB_URL,
            max_context_tokens=DEFAULT_MAX_CONTEXT_TOKENS
        )
        lightrag_url = config.lightrag_url

        params = {"label": label, "max_depth": max_depth, "max_nodes": max_nodes}

        response = requests.get(
            f"{lightrag_url}/graphs",
            params=params,
            timeout=30
        )
        response.raise_for_status()
        return response.json()

    except requests.exceptions.ConnectionError as e:
        raise requests.exceptions.ConnectionError(f"Failed to connect to LightRAG service.: {e}")
    except requests.exceptions.Timeout as e:
        raise requests.exceptions.Timeout(f"LightRAG service request timed out.: {e}")
    except requests.exceptions.HTTPError as e:
        raise e
    except Exception as e:
        raise Exception(f"Unexpected error: {e}")