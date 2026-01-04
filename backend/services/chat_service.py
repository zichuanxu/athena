import requests
import tiktoken
from typing import List
from models.schemas import ChatMessage, ConfigData
from config.config import CONFIG_DATA, DEFAULT_LIGHT_RAG_URL, DEFAULT_DB_URL, DEFAULT_MAX_CONTEXT_TOKENS

try:
    tokenizer = tiktoken.get_encoding("cl100k_base")
except Exception:
    tokenizer = tiktoken.get_encoding("gpt2")


def count_tokens(text: str) -> int:
    return len(tokenizer.encode(text))

def get_rag_answer(question: str, conversation_history: List[ChatMessage]) -> str:
    try:
        config = CONFIG_DATA or ConfigData(
            lightrag_url=DEFAULT_LIGHT_RAG_URL,
            database_url=DEFAULT_DB_URL,
            max_context_tokens=DEFAULT_MAX_CONTEXT_TOKENS
        )
        max_tokens = config.max_context_tokens

        limited_history = []
        current_tokens = 0
        for msg in reversed(conversation_history):
            msg_tokens = count_tokens(msg.content)
            if current_tokens + msg_tokens > max_tokens:
                break
            limited_history.append(msg)
            current_tokens += msg_tokens

        limited_history.reverse()

        history_messages_to_use = len(limited_history)

        payload = {
            "query": question,
            "conversation_history": [
                {"role": msg.role, "content": msg.content} for msg in limited_history
            ],
            "history_turns": history_messages_to_use,
            "response_type": "string"
        }

        lightrag_url = config.lightrag_url

        response = requests.post(
            f"{lightrag_url}/query",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=300
        )
        response.raise_for_status()
        response_data = response.json()
        return response_data.get("response", "No response received from RAG service")

    except requests.exceptions.ConnectionError:
        return "Failed to connect to RAG service."
    except requests.exceptions.Timeout:
        return "RAG service request timed out."
    except requests.exceptions.HTTPError as e:
        return f"RAG service returned an error: {e}"
    except Exception as e:
        return f"Unexpected error when calling RAG service: {e}"