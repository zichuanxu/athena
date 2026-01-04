# athena

## Demo

![img](assets/4.jpg)

![img](assets/2.jpg)

![Graph Query](assets/3.jpg)

## Architecture

![Athena](https://file+.vscode-resource.vscode-cdn.net/d%3A/Develop/WorkSpace/projects/athena/assets/1.jpg)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React 19 + Vite)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Chat UI    │  │ Graph Query │  │  Visual Graph Explorer  │  │
│  │  (Markdown) │  │  Interface  │  │  (react-force-graph-2d) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                         │ i18next (EN/JA)                        │
└─────────────────────────┼───────────────────────────────────────┘
                          │ REST API
┌─────────────────────────┼───────────────────────────────────────┐
│                    Backend (FastAPI)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Chat Router │  │Graph Router │  │    Config Router        │  │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘  │
│         │                │                                       │
│  ┌──────▼──────┐  ┌──────▼──────┐                               │
│  │Chat Service │  │Graph Service│  ← tiktoken / cachetools      │
│  └──────┬──────┘  └──────┬──────┘                               │
└─────────┼────────────────┼──────────────────────────────────────┘
          │                │
┌─────────▼────────────────▼──────────────────────────────────────┐
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │   LightRAG Server   │  │   PostgreSQL (asyncpg + JSONB)  │   │
│  └─────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** 14+
- **LightRAG Server** (see [mm_enshu_lightrag](https://github.com/Acow337/mm_enshu_lightrag))

### Database Setup

1. Install and start PostgreSQL
2. Create database and user:

```sql
CREATE DATABASE mm_enshu;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE mm_enshu TO postgres;
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Configuration

Edit `backend/config/config.json` to customize:

```json
{
  "lightrag_url": "http://localhost:9621",
  "database_url": "postgresql+asyncpg://postgres:postgres@localhost:5432/mm_enshu",
  "max_context_tokens": 4096
}
```

Or use the Settings modal in the web interface to update configuration at runtime.

---

## Tech Stack

### Frontend

| Technology           | Purpose                 |
| -------------------- | ----------------------- |
| React 19             | UI Framework            |
| Vite                 | Build Tool & Dev Server |
| React Router v7      | Client-side Routing     |
| react-force-graph-2d | Graph Visualization     |
| i18next              | Internationalization    |
| axios                | HTTP Client             |
| react-markdown       | Markdown Rendering      |

### Backend

| Technology     | Purpose               |
| -------------- | --------------------- |
| FastAPI        | Web Framework         |
| SQLAlchemy 2.0 | Async ORM             |
| asyncpg        | PostgreSQL Driver     |
| Pydantic       | Data Validation       |
| tiktoken       | Token Counting        |
| cachetools     | In-memory Caching     |
| thefuzz        | Fuzzy String Matching |

### External Services

| Service    | Purpose               |
| ---------- | --------------------- |
| LightRAG   | RAG + Knowledge Graph |
| PostgreSQL | Data Persistence      |

---

## API Endpoints

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| GET    | `/api/chats`              | List all chat sessions   |
| GET    | `/api/chats/{id}`         | Get chat session details |
| POST   | `/api/chats`              | Create new chat session  |
| POST   | `/api/chats/{id}/message` | Add message to session   |
| PATCH  | `/api/chats/{id}/title`   | Rename chat session      |
| DELETE | `/api/chats/{id}`         | Delete chat session      |
| POST   | `/api/ask`                | Send question to AI      |
| GET    | `/api/graph-query`        | Query knowledge graph    |
| GET    | `/api/config`             | Get configuration        |
| POST   | `/api/config`             | Update configuration     |

---

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   ├── config.py          # Configuration management
│   │   └── config.json        # Runtime configuration
│   ├── locales/
│   │   ├── en/graph.json      # English translations
│   │   └── ja/graph.json      # Japanese translations
│   ├── models/
│   │   ├── database.py        # SQLAlchemy models
│   │   └── schemas.py         # Pydantic schemas
│   ├── routes/
│   │   ├── chat.py            # Chat API endpoints
│   │   ├── config.py          # Config API endpoints
│   │   └── graph.py           # Graph API endpoints
│   ├── services/
│   │   ├── chat_service.py    # RAG integration
│   │   └── graph_service.py   # Graph data fetching
│   ├── main.py                # FastAPI application
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── public/
│   │   └── locales/           # i18n translation files
│   │       ├── en/
│   │       └── ja/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── css/               # Stylesheets
│   │   ├── pages/             # Page components
│   │   ├── App.jsx            # Root component
│   │   ├── i18n.jsx           # i18n configuration
│   │   └── index.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── assets/                    # Demo screenshots
└── README.md
```

---

## Key Technical Highlights

### Async Database Operations

- Full async support with `asyncpg` driver
- JSONB storage for flexible message history
- `MutableList` for proper change tracking

### Token Management

- Precise token counting with `tiktoken`
- Sliding window context management
- Configurable token limits

### User Experience

- IME (Input Method Editor) compatibility for Japanese input
- Fuzzy entity search with suggestions
- Smooth animations and transitions
- Responsive design for mobile devices

### Internationalization

- Namespace-based translation organization
- Lazy loading of translation files
- Backend error message localization

---

## Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests (if configured)
cd backend
pytest
```

### Building for Production

```bash
# Frontend build
cd frontend
npm run build

# Output will be in frontend/build/
```

---

## License

This project is developed at Onizuka Lab, Osaka University.

© 2025 Onizuka Lab, Osaka University. All rights reserved.

---

## Acknowledgments

- [LightRAG](https://github.com/HKUDS/LightRAG) - Knowledge Graph RAG Framework
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python Web Framework
- [React](https://react.dev/) - UI Library
- [react-force-graph](https://github.com/vasturiano/react-force-graph) - Graph Visualization
