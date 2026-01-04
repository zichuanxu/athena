from pydantic import BaseModel
from typing import List, Optional

class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = None
    role: str = "user"

# Chat message structure
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: float  # Timestamp

# Chat session structure
class ChatSession(BaseModel):
    session_id: str
    title: str
    messages: List[ChatMessage]
    last_update: float

# Chat session list item (for indexing)
class ChatListItem(BaseModel):
    session_id: str
    title: str
    last_update: float

class AnswerResponse(BaseModel):
    answer: str
    session_id: str

class ConfigData(BaseModel):
    lightrag_url: str
    database_url: str
    max_context_tokens: int

