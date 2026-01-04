import uuid
import time
from typing import List, Any, Dict
from fastapi import APIRouter, HTTPException, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.schemas import QueryRequest, AnswerResponse, ChatMessage, ChatSession, ChatListItem
from models.database import DBSession, get_db_session
from services.chat_service import get_rag_answer
chat_router = APIRouter()


@chat_router.get("/api/chats", response_model=List[ChatListItem])
async def list_chats(db: AsyncSession = Depends(get_db_session)):
    result = await db.execute(
        select(DBSession.session_id, DBSession.title, DBSession.last_update)
        .order_by(DBSession.last_update.desc())
    )
    chats = result.all()
    return [ChatListItem(session_id=c[0], title=c[1], last_update=c[2]) for c in chats]

@chat_router.get("/api/chats/{session_id}", response_model=ChatSession)
async def get_chat(session_id: str, db: AsyncSession = Depends(get_db_session)):
    db_session = await db.get(DBSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages_list: List[Dict[str, Any]] = db_session.messages if db_session.messages else []
    messages = [ChatMessage(**msg) for msg in messages_list]
    return ChatSession(
        session_id=db_session.session_id,
        title=db_session.title,
        last_update=db_session.last_update,
        messages=messages
    )

@chat_router.post("/api/chats", response_model=ChatSession)
async def create_chat(db: AsyncSession = Depends(get_db_session)):
    session_id = str(uuid.uuid4())
    now = time.time()

    new_session = DBSession(
        session_id=session_id,
        title="New Session",
        messages=[],
        last_update=now
    )

    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)

    return ChatSession(
        session_id=new_session.session_id,
        title=new_session.title,
        last_update=new_session.last_update,
        messages=[]
    )

@chat_router.post("/api/chats/{session_id}/message", response_model=ChatSession)
async def add_message(session_id: str, message: ChatMessage, db: AsyncSession = Depends(get_db_session)):
    db_session = await db.get(DBSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    now = time.time()
    messages_list: List[Dict[str, Any]] = db_session.messages if db_session.messages else []
    messages_list.append(message.model_dump())
    db_session.messages = messages_list
    db_session.last_update = now

    if len(messages_list) == 1 and message.role == "user":
        db_session.title = message.content[:20]

    await db.commit()
    await db.refresh(db_session)

    messages_result: List[Dict[str, Any]] = db_session.messages if db_session.messages else []
    messages = [ChatMessage(**msg) for msg in messages_result]
    return ChatSession(
        session_id=db_session.session_id,
        title=db_session.title,
        last_update=db_session.last_update,
        messages=messages
    )

@chat_router.delete("/api/chats/{session_id}")
async def delete_chat(session_id: str, db: AsyncSession = Depends(get_db_session)):
    db_session = await db.get(DBSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.delete(db_session)
    await db.commit()
    return {"success": True}

@chat_router.patch("/api/chats/{session_id}/title")
async def rename_chat(session_id: str, title: str = Body(..., embed=True), db: AsyncSession = Depends(get_db_session)):
    db_session = await db.get(DBSession, session_id)
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    db_session.title = title
    await db.commit()
    return {"success": True}

@chat_router.post("/api/ask", response_model=AnswerResponse)
async def handle_ask(request: QueryRequest, db: AsyncSession = Depends(get_db_session)):
    session_id = request.session_id
    now = time.time()

    if session_id:
        db_session = await db.get(DBSession, session_id)
    else:
        db_session = None

    if not db_session:
        session_id = str(uuid.uuid4())
        db_session = DBSession(
            session_id=session_id,
            title=request.query[:20],
            messages=[],
            last_update=now
        )
        db.add(db_session)

    messages_list: List[Dict[str, Any]] = db_session.messages if db_session.messages else []
    history_models = [ChatMessage(**msg) for msg in messages_list]

    answer_text = get_rag_answer(
        question=request.query,
        conversation_history=history_models
    )

    user_message = ChatMessage(role="user", content=request.query, timestamp=now)
    ai_message = ChatMessage(role="assistant", content=answer_text, timestamp=time.time())

    current_messages: List[Dict[str, Any]] = list(messages_list)
    current_messages.append(user_message.model_dump())
    current_messages.append(ai_message.model_dump())
    db_session.messages = current_messages
    db_session.last_update = ai_message.timestamp

    await db.commit()

    return {"answer": answer_text, "session_id": db_session.session_id}

