import { useState } from "react";
import "../css/Graph.css";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function GraphQueryInterface({ onBack }) {
  const [label, setLabel] = useState("");
  const [maxDepth, setMaxDepth] = useState(1);
  const [maxNodes, setMaxNodes] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState("");

  const { t, i18n } = useTranslation('graph');

  const handleSearch = async () => {
    if (!label.trim()) {
      setError(t("errors.labelRequired"));
      return;
    }

    if (maxDepth < 1) {
      setError(t("errors.depthMin"));
      return;
    }

    if (maxNodes < 1) {
      setError(t("errors.nodesMin"));
      return;
    }

    setError("");
    setLoading(true);

    try {

      const response = await axios.get("http://localhost:8000/api/graph-query", {
        params: { label: label.trim(), max_depth: maxDepth, max_nodes: maxNodes },
        headers: { "Accept-Language": i18n.language },
      });

      const data = response.data;

      if (!data.exists) {
        setError(data.data);
        setGraphData(null);
      } else {
        setGraphData(data.data);
        setError("");
      }

    } catch (e) {
      console.error("Failed to fetch graph data:", e);
      setError(e.message || t("errors.fetchFailedRetry"));
    } finally {
      setLoading(false);
    }
  };

  const handleMaxDepthChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setMaxDepth(value);
    }
  };

  const handleMaxNodesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setMaxNodes(value);
    }
  };

  return (
    <div className="graph-query-container">
      <div className="graph-query-header">
        <div className="header-left">
          <div className="page-title">
            <h1>{t("header.title")}</h1>
            <span className="page-subtitle">{t("header.subtitle")}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={onBack} title={t("header.backToHomeTitle")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            {t("header.homeButton")}
          </button>
        </div>
      </div>

      <div className="search-controls">
        <div className="search-row">
          <div className="input-group">
            <label htmlFor="label-input">{t("controls.label")} *</label>
            <input
              id="label-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t("controls.labelPlaceholder")}
              className="label-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleSearch();
                }
              }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="max-depth-input">{t("controls.maxDepth")}</label>
            <input
              id="max-depth-input"
              type="number"
              value={maxDepth}
              onChange={handleMaxDepthChange}
              min="1"
              className="number-input"
            />
          </div>
          <div className="input-group">
            <label htmlFor="max-nodes-input">{t("controls.maxNodes")}</label>
            <input
              id="max-nodes-input"
              type="number"
              value={maxNodes}
              onChange={handleMaxNodesChange}
              min="1"
              className="number-input"
            />
          </div>
          <button
            className="search-btn"
            onClick={handleSearch}
            disabled={loading || !label.trim()}
            title={t("controls.searchTitle")}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                {t("controls.searchButton")}
              </>
            )}
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="graph-visualization">
        {!graphData && !loading && (
          <div className="graph-placeholder">
            <div className="placeholder-content">

              <h3>{t("placeholder.title")}</h3>
              <p>{t("placeholder.description")}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="graph-loading">
            <div className="loading-content">
              <div className="loading-spinner large"></div>
              <h3>{t("loading.title")}</h3>
              <p>{t("loading.description")}</p>
            </div>
          </div>
        )}

        {graphData && (
          <div className="graph-results">

            <div className="graph-content">
              <div className="nodes-section">
                <h3>{t("results.nodesTitle", { count: graphData.nodes?.length || 0 })}</h3>
                <div className="nodes-list">
                  {graphData.nodes?.map((node, index) => (
                    <div key={index} className="node-card">
                      <div className="node-header">
                        <h4 className="node-title">{node.id}</h4>
                        <span className="node-type">{node.properties?.entity_type || t("results.unknown")}</span>
                      </div>
                      <p className="node-description">
                        {node.properties?.description || t("results.noDescription")}
                      </p>
                      {node.properties?.source_id && (
                        <div className="node-meta">
                          <span className="meta-label">{t("results.sourceLabel")}</span>
                          <span className="meta-value">{node.properties.file_path || t("results.unknown")}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="edges-section">
                <h3>{t("results.relationshipsTitle", { count: graphData.edges?.length || 0 })}</h3>
                <div className="edges-list">
                  {graphData.edges?.map((edge, index) => (
                    <div key={index} className="edge-card">
                      <div className="edge-connection">
                        <span className="edge-source">{edge.source}</span>
                        <div className="edge-arrow">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                        <span className="edge-target">{edge.target}</span>
                      </div>
                      <p className="edge-description">
                        {edge.properties?.description || t("results.noDescription")}
                      </p>
                      <div className="edge-meta">
                        <span className="edge-weight">{t("results.weightLabel", { weight: edge.properties?.weight || t("results.notAvailable") })}</span>
                        {edge.properties?.keywords && (
                          <span className="edge-keywords">{t("results.keywordsLabel", { keywords: edge.properties.keywords })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GraphQueryInterface;