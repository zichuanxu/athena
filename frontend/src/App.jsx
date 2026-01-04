import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";

import Homepage from "./pages/Homepage";
import ModernChatInterface from "./pages/ModernChatInterface";
import GraphQueryInterface from "./pages/GraphQueryInterface";
import SettingsModal from "./components/SettingsModal";
import VisualGraphExplorer from './pages/VisualGraphExplorer';

function AppContent() {
  const [showSettings, setShowSettings] = useState(false);
  const [lightragUrl, setLightragUrl] = useState("");
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [maxContextTokens, setMaxContextTokens] = useState(0);
  const navigate = useNavigate();

  const loadConfig = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/config");
      if (res.ok) {
        const data = await res.json();
        setLightragUrl(data.lightrag_url || "");
        setDatabaseUrl(data.database_url || "");
        setMaxContextTokens(data.max_context_tokens || 0);
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    }
  };


  const openSettings = async () => {
    await loadConfig();
    setShowSettings(true);
  };

  const saveConfig = async () => {
    try {
      await fetch("http://localhost:8000/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lightrag_url: lightragUrl,
          database_url: databaseUrl,
          max_context_tokens: maxContextTokens
        }),
      });
      setShowSettings(false);
    } catch (e) {
      alert("Failed to save config");
    }
  };

  const handleNavigate = (page) => {
    if (page === "chatbot") {
      navigate("/ask-ai");
    } else if (page === "graph") {
      navigate("/graph-query");
    } else if (page === "explore") {
      navigate("/graph-explore");
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Homepage onNavigate={handleNavigate} onSettingsClick={openSettings} />} />
        <Route path="/ask-ai" element={<ModernChatInterface onBack={handleBack} />} />
        <Route path="/graph-query" element={<GraphQueryInterface onBack={handleBack} />} />
        <Route path="/graph-explore" element={<VisualGraphExplorer onBack={handleBack} />} />
      </Routes>

      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        lightragUrl={lightragUrl}
        setLightragUrl={setLightragUrl}
        databaseUrl={databaseUrl}
        setDatabaseUrl={setDatabaseUrl}
        maxContextTokens={maxContextTokens}
        setMaxContextTokens={setMaxContextTokens}
        saveConfig={saveConfig}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;