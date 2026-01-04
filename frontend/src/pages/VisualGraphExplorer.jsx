import { useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import "../css/VisualGraphExplorer.css";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function VisualGraphExplorer({ onBack }) {
  const [label, setLabel] = useState("");
  const [maxDepth, setMaxDepth] = useState(1);
  const [maxNodes, setMaxNodes] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);

  const { t, i18n } = useTranslation('graph');
  const fgRef = useRef();
  const containerRef = useRef();

  const handleSearch = async () => {
    if (!label.trim()) {
      setError(t("errors.labelRequired"));
      return;
    }

    setError("");
    setLoading(true);
    setGraphData(null);
    setSelectedNode(null);

    try {
      const response = await axios.get("http://localhost:8000/api/graph-query", {
        params: {
          label: label.trim(),
          max_depth: maxDepth,
          max_nodes: maxNodes
        },
        headers: { "Accept-Language": i18n.language }
      });

      const data = response.data;
      if (!data.exists) {
        setGraphData(null);
        setError(data.data);
      } else {
        const transformedData = {
          nodes: data.data.nodes.map(node => ({
            id: node.id,
            name: node.id,
            type: node.properties?.entity_type || t('results.unknown'),
            description: node.properties?.description || '',
            labels: node.labels || [],
            ...node
          })),
          links: data.data.edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            label: edge.properties?.description?.split('<SEP>')[0] || '',
            id: edge.id,
            ...edge
          })),
          is_truncated: data.data.is_truncated
        };
        setGraphData(transformedData);
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
    if (!isNaN(value) && value >= 1) setMaxDepth(value);
  };

  const handleMaxNodesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) setMaxNodes(value);
  };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode({
      id: node.id,
      label: node.name,
      type: node.type,
      description: node.description,
      labels: node.labels || [],
      properties: node.properties || {}
    });
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  const handleZoomIn = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() * 1.3, 300);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      fgRef.current.zoom(fgRef.current.zoom() / 1.3, 300);
    }
  };

  const handleZoomToFit = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400);
    }
  };

  const handleCenterGraph = () => {
    if (fgRef.current) {
      fgRef.current.centerAt(0, 0, 300);
      fgRef.current.zoom(1, 300);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleEdgeLabels = () => {
    setShowEdgeLabels(prev => !prev);
  };

  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;

    const nodeColor = node.type === 'event' ? '#f5a623' : node.type === 'category' ? '#4e8df5' : '#9b59b6';

    ctx.beginPath();
    ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = nodeColor;
    ctx.fill();

    if (selectedNode && selectedNode.id === node.id) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3 / globalScale;
      ctx.stroke();
      ctx.strokeStyle = nodeColor;
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';
    ctx.fillText(label, node.x, node.y + 10);
  }, [selectedNode]);

  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source;
    const end = link.target;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    const arrowLength = 8 / globalScale;
    const arrowWidth = 4 / globalScale;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    ctx.save();
    ctx.translate(end.x, end.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(-arrowLength, -arrowWidth);
    ctx.lineTo(0, 0);
    ctx.lineTo(-arrowLength, arrowWidth);
    ctx.fillStyle = '#999';
    ctx.fill();
    ctx.restore();

    if (showEdgeLabels && link.label && globalScale > 1) {
      const fontSize = 10 / globalScale;
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      ctx.fillText(link.label, midX, midY - 5);
    }
  }, [showEdgeLabels]);

  return (
    <div className="graph-query-container" ref={containerRef}>
      <div className="graph-query-header">
        <div className="header-left">
          <div className="page-title">
            <h1>{t('header.explorerTitle')}</h1>
            <span className="page-subtitle">{t('header.explorerSubtitle')}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={onBack} title={t('header.backToHomeTitle')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            {t('header.homeButton')}
          </button>
        </div>
      </div>

      <div className="search-controls">
        <div className="search-row">
          <div className="input-group">
            <label htmlFor="label-input">{t('controls.labelRequired')}</label>
            <input
              id="label-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t('controls.labelPlaceholder')}
              className="label-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  handleSearch();
                }
              }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="max-depth-input">{t('controls.maxDepth')}</label>
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
            <label htmlFor="max-nodes-input">{t('controls.maxNodes')}</label>
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
            title={t('controls.searchTitle')}
          >
            {loading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                {t('controls.searchButton')}
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
              <h3>{t('placeholder.explorerTitle')}</h3>
              <p>{t('placeholder.explorerDescription')}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="graph-loading">
            <div className="loading-content">
              <div className="loading-spinner large"></div>
              <h3>{t('loading.title')}</h3>
              <p>{t('loading.description')}</p>
            </div>
          </div>
        )}


        {graphData && (
          <div className="graph-results">
            <div className="graph-stats-text">
              {graphData.nodes?.length || 0} {t('stats.nodes')}
            </div>

            <div className="graph-controls">
              <button className="control-btn" onClick={handleZoomIn} title={t('graphControls.zoomIn')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <button className="control-btn" onClick={handleZoomOut} title={t('graphControls.zoomOut')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <button className="control-btn" onClick={handleZoomToFit} title={t('graphControls.fitToScreen')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              </button>
              <button className="control-btn" onClick={handleCenterGraph} title={t('graphControls.centerGraph')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </button>

              <button
                className={`control-btn ${showEdgeLabels ? 'active' : ''}`}
                onClick={toggleEdgeLabels}
                title={t('graphControls.showEdgeLabels')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showEdgeLabels ? (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  )}
                </svg>
              </button>

              <button className="control-btn" onClick={toggleFullscreen} title={t('graphControls.toggleFullscreen')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isFullscreen ? (
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  ) : (
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  )}
                </svg>
              </button>
            </div>

            <div className={`node-info-panel ${selectedNode ? 'visible' : ''}`}>
              {selectedNode ? (
                <>
                  <div className="node-info-header">
                    <h3>{t('nodeInfo.title')}</h3>
                    <button className="close-panel-btn" onClick={handleClosePanel} title={t('nodeInfo.close')}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="node-info-content">
                    <div className="info-section">
                      <label className="info-label">{t('nodeInfo.id')}</label>
                      <div className="info-value id-value">{selectedNode.id}</div>
                    </div>

                    <div className="info-section">
                      <label className="info-label">{t('nodeInfo.type')}</label>
                      <div className={`info-value type-badge type-${selectedNode.type}`}>
                        {selectedNode.type}
                      </div>
                    </div>

                    {selectedNode.labels && selectedNode.labels.length > 0 && (
                      <div className="info-section">
                        <label className="info-label">{t('nodeInfo.labels')}</label>
                        <div className="labels-container">
                          {selectedNode.labels.map((label, idx) => (
                            <span key={idx} className="label-tag">{label}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="info-section">
                      <label className="info-label">{t('nodeInfo.description')}</label>
                      <div className="info-value description-value">
                        {selectedNode.description || t('results.noDescription')}
                      </div>
                    </div>

                    {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                      <div className="info-section">
                        <label className="info-label">{t('nodeInfo.properties')}</label>
                        <div className="properties-list">
                          {Object.entries(selectedNode.properties).map(([key, value]) => (
                            <div key={key} className="property-item">
                              <span className="property-key">{key}:</span>
                              <span className="property-value">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="node-info-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <p>{t('nodeInfo.emptyState')}</p>
                </div>
              )}
            </div>

            <div className={`graph-content-visual ${selectedNode ? 'with-panel' : ''}`}>
              <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeLabel="name"
                nodeCanvasObject={paintNode}
                linkCanvasObject={paintLink}
                onNodeClick={handleNodeClick}
                onBackgroundClick={handleBackgroundClick}
                nodeRelSize={5}
                linkDirectionalArrowLength={0}
                linkDirectionalArrowRelPos={1}
                linkWidth={1}
                linkColor={() => '#999'}
                cooldownTicks={100}
                onEngineStop={() => fgRef.current?.zoomToFit(400)}
                enableNodeDrag={true}
                enableZoomInteraction={true}
                enablePanInteraction={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualGraphExplorer;